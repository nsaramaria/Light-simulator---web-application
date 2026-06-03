const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const router = express.Router();

const MESHY_BASE = 'https://api.meshy.ai/openapi/v1/image-to-3d';
const TEST_KEY = 'msy_dummy_api_key_for_test_mode_12345678';
const PLAN_LIMITS = { free: Number(process.env.FREE_GENERATION_LIMIT) || 5, pro: 100 };

const PACKS = {
  starter: { id: 'starter', credits: 10, price: '€2', label: 'Starter' },
  popular: { id: 'popular', credits: 50, price: '€8', label: 'Popular', best: true },
  studio: { id: 'studio', credits: 200, price: '€25', label: 'Studio' },
};

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const headers = (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });
const testAllowed = () => String(process.env.ALLOW_TEST_GENERATION).toLowerCase() === 'true';
const purchaseAllowed = () => String(process.env.ALLOW_SIMULATED_PURCHASE).toLowerCase() === 'true';
const ownerKey = () => process.env.MESHY_API_KEY || '';
const limitFor = (plan) => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
const keyForRequest = (useTest) => (useTest ? TEST_KEY : ownerKey());
const allowanceFor = (u) => limitFor(u?.plan || 'free') + (u?.purchasedCredits || 0);
const packList = () => Object.values(PACKS);

router.get('/usage', auth, async (req, res) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: { plan: true, generationsUsed: true, purchasedCredits: true } });
    const plan = u?.plan || 'free';
    const limit = allowanceFor(u);
    const used = u?.generationsUsed || 0;
    res.json({
      plan,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      testAvailable: testAllowed(),
      canBuy: purchaseAllowed(),
      packs: packList(),
    });
  } catch (err) {
    console.error('usage error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/purchase', auth, async (req, res) => {
  if (!purchaseAllowed()) return res.status(503).json({ error: 'Payments are not set up yet.' });
  const pack = PACKS[req.body.pack];
  if (!pack) return res.status(400).json({ error: 'Unknown credit pack.' });
  try {
    const u = await prisma.user.update({
      where: { id: req.user.id },
      data: { purchasedCredits: { increment: pack.credits } },
      select: { plan: true, generationsUsed: true, purchasedCredits: true },
    });
    const limit = allowanceFor(u);
    res.json({ added: pack.credits, used: u.generationsUsed, limit, remaining: Math.max(0, limit - u.generationsUsed) });
  } catch (err) {
    console.error('purchase error:', err);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

router.post('/image-to-3d', auth, async (req, res) => {
  const { imageDataUri, texturePrompt, testMode } = req.body;
  const useTest = !!testMode && testAllowed();

  if (!imageDataUri) return res.status(400).json({ error: 'No image provided' });

  if (!useTest) {
    if (!ownerKey()) return res.status(500).json({ error: 'Image-to-3D is not configured on the server.' });
    const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: { plan: true, generationsUsed: true, purchasedCredits: true } });
    const limit = allowanceFor(u);
    if ((u?.generationsUsed || 0) >= limit) {
      return res.status(402).json({ error: `You've used all ${limit} of your generations.`, limitReached: true, used: u.generationsUsed, limit });
    }
  }

  try {
    const body = { image_url: imageDataUri, target_formats: ['glb'] };
    if (texturePrompt && texturePrompt.trim()) body.texture_prompt = texturePrompt.trim();

    const r = await fetch(MESHY_BASE, { method: 'POST', headers: headers(keyForRequest(useTest)), body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Generation request failed' });

    if (!useTest) {
      await prisma.user.update({ where: { id: req.user.id }, data: { generationsUsed: { increment: 1 } } });
    }
    res.json({ taskId: data.result, testMode: useTest });
  } catch (err) {
    console.error('generate start error:', err);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

router.get('/image-to-3d/:taskId', auth, async (req, res) => {
  const useTest = req.query.test === '1' && testAllowed();
  const key = keyForRequest(useTest);
  if (!key) return res.status(500).json({ error: 'Image-to-3D is not configured on the server.' });
  try {
    const r = await fetch(`${MESHY_BASE}/${req.params.taskId}`, { headers: headers(key) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Status check failed' });
    res.json({
      status: data.status,
      progress: data.progress ?? 0,
      hasModel: !!(data.model_urls && data.model_urls.glb),
      error: data.task_error?.message || null,
    });
  } catch (err) {
    console.error('generate poll error:', err);
    res.status(500).json({ error: 'Failed to check generation status' });
  }
});

router.get('/image-to-3d/:taskId/model', auth, async (req, res) => {
  const useTest = req.query.test === '1' && testAllowed();
  const key = keyForRequest(useTest);
  if (!key) return res.status(500).json({ error: 'Image-to-3D is not configured on the server.' });
  try {
    const r = await fetch(`${MESHY_BASE}/${req.params.taskId}`, { headers: headers(key) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Status check failed' });

    const glbUrl = data.model_urls?.glb;
    if (data.status !== 'SUCCEEDED' || !glbUrl) return res.status(409).json({ error: 'Model not ready yet' });

    const glb = await fetch(glbUrl);
    if (!glb.ok) return res.status(502).json({ error: 'Failed to download generated model' });

    const buf = Buffer.from(await glb.arrayBuffer());
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', 'inline; filename="generated.glb"');
    res.send(buf);
  } catch (err) {
    console.error('generate model error:', err);
    res.status(500).json({ error: 'Failed to fetch generated model' });
  }
});

module.exports = router;
