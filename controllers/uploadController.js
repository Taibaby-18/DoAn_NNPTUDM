const MediaAsset = require('../models/MediaAsset');

module.exports = {
  // Upload media file
  UploadMedia: async function (entityId, entityModel, mediaType, filePath) {
    const mediaAsset = new MediaAsset({
      entityId,
      entityModel,
      url: filePath,
      mediaType
    });

    await mediaAsset.save();
    return mediaAsset;
  }
};
