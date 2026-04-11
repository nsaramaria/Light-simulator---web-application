const express = require('express');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');

const router = express.Router();

// Middleware :check if user is logged in
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

// Save a new scene
router.post('/', auth, async (req, res) => {
  try {
    const { name, sceneData } = req.body;

    if (!name || !sceneData) {
      return res.status(400).json({ error: 'Name and scene data are required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('name', sql.NVarChar, name)
      .input('sceneData', sql.NVarChar(sql.MAX), JSON.stringify(sceneData))
      .query('INSERT INTO scenes (user_id, name, scene_data) OUTPUT INSERTED.id, INSERTED.name, INSERTED.created_at VALUES (@userId, @name, @sceneData)');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Save scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all scenes for the logged in user
router.get('/', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('SELECT id, name, created_at, updated_at FROM scenes WHERE user_id = @userId ORDER BY updated_at DESC');

    res.json(result.recordset);
  } catch (err) {
    console.error('Get scenes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single scene
router.get('/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('SELECT id, name, scene_data, created_at, updated_at FROM scenes WHERE id = @id AND user_id = @userId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const scene = result.recordset[0];
    scene.scene_data = JSON.parse(scene.scene_data);
    res.json(scene);
  } catch (err) {
    console.error('Get scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a scene
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, sceneData } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .input('name', sql.NVarChar, name)
      .input('sceneData', sql.NVarChar(sql.MAX), JSON.stringify(sceneData))
      .query('UPDATE scenes SET name = @name, scene_data = @sceneData, updated_at = GETDATE() WHERE id = @id AND user_id = @userId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.json({ message: 'Scene updated' });
  } catch (err) {
    console.error('Update scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a scene
router.delete('/:id', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('DELETE FROM scenes WHERE id = @id AND user_id = @userId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.json({ message: 'Scene deleted' });
  } catch (err) {
    console.error('Delete scene error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;