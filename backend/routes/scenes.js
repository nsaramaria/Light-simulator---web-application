const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../db');

const router = express.Router();

// Middleware: check if user is logged in
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const toListRow = (s) => ({
  id: s.id,
  name: s.name,
  created_at: s.createdAt,
  updated_at: s.updatedAt,
});

const toFullRow = (s) => ({
  id: s.id,
  name: s.name,
  scene_data: JSON.parse(s.sceneData),
  created_at: s.createdAt,
  updated_at: s.updatedAt,
});

// Save a new scene
router.post('/', auth, async (req, res) => {
  try {
    const { name, sceneData } = req.body;

    if (!name || !sceneData) {
      return res.status(400).json({ error: 'Name and scene data are required' });
    }

    const scene = await prisma.scene.create({
      data: {
        userId: req.user.id,
        name,
        sceneData: JSON.stringify(sceneData),
      },
    });

    res.status(201).json(toListRow(scene));
  } catch (err) {
    console.error('Save scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all scenes for the logged in user
router.get('/', auth, async (req, res) => {
  try {
    const scenes = await prisma.scene.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });

    res.json(scenes.map(toListRow));
  } catch (err) {
    console.error('Get scenes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single scene
router.get('/:id', auth, async (req, res) => {
  try {
    const scene = await prisma.scene.findFirst({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.json(toFullRow(scene));
  } catch (err) {
    console.error('Get scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a scene
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, sceneData } = req.body;

    // updateMany lets scope by userId in the same query
    const result = await prisma.scene.updateMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
      data: { name, sceneData: JSON.stringify(sceneData) },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const updated = await prisma.scene.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      select: { updatedAt: true },
    });

    res.json({ message: 'Scene updated', updated_at: updated?.updatedAt });
  } catch (err) {
    console.error('Update scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a scene
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await prisma.scene.deleteMany({
      where: { id: parseInt(req.params.id, 10), userId: req.user.id },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.json({ message: 'Scene deleted' });
  } catch (err) {
    console.error('Delete scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;