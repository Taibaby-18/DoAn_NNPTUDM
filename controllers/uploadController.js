const MediaAsset = require('../models/MediaAsset');
const path = require('path');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { entityId, entityModel, mediaType } = req.body;
    const url = `/uploads/${req.file.filename}`;

    const mediaAsset = new MediaAsset({
      entityId,
      entityModel,
      url,
      mediaType
    });

    await mediaAsset.save();
    res.json({ message: 'File uploaded successfully', mediaAsset });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

