const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/Publisher/publisherController');
const { protect, authorize } = require('../middleware/auth');
const { uploadGameMedia } = require('../middleware/upload');

router.get('/my-games', protect, authorize('Publisher'), async function (req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const result = await publisherController.GetMyGames(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/games', protect, authorize('Publisher'), uploadGameMedia, async function (req, res, next) {
  try {
    const { title, description, price, pcRequirements, category, trailerUrl } = req.body;
    const userId = req.user._id || req.user.id;

    const User = require('../models/User');
    const user = await User.findById(userId).select('publisherProfile');
    if (!user || !user.publisherProfile) {
      return res.status(400).json({ success: false, message: 'Tài khoản chưa có Publisher Profile' });
    }
    const publisherId = user.publisherProfile;

    const thumbnail = req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';
    const gallery = req.files && req.files['gallery'] ? req.files['gallery'].map(file => `/uploads/${file.filename}`) : [];
    const trailerVideo = req.files && req.files['trailer'] ? `/uploads/${req.files['trailer'][0].filename}` : trailerUrl || '';

    const result = await publisherController.CreateGame(title, description, price, pcRequirements, category, publisherId, thumbnail, gallery, trailerVideo);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/games/:id', protect, authorize('Publisher'), uploadGameMedia, async function (req, res, next) {
  try {
    const { title, description, price, pcRequirements, category } = req.body;
    const userId = req.user._id || req.user.id;

    const fieldsToUpdate = {};
    if (title)                        fieldsToUpdate.title           = title;
    if (description)                  fieldsToUpdate.description     = description;
    if (price !== undefined)          fieldsToUpdate.price           = price;
    if (pcRequirements !== undefined) fieldsToUpdate.pcRequirements  = pcRequirements;
    if (category)                     fieldsToUpdate.category        = category;
    if (req.files && req.files['thumbnail']) {
      fieldsToUpdate.thumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
    }
    if (req.files && req.files['gallery']) {
      fieldsToUpdate.gallery = req.files['gallery'].map(f => `/uploads/${f.filename}`);
    }
    if (req.files && req.files['trailer']) {
      fieldsToUpdate.trailerVideo = `/uploads/${req.files['trailer'][0].filename}`;
    }

    const result = await publisherController.UpdateGame(req.params.id, userId, fieldsToUpdate);
    res.status(200).json(result);
  } catch (error) {
    const status = error.message.includes('quyền') ? 403
                 : error.message === 'Game not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

module.exports = router;
