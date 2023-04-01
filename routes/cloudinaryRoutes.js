const express = require('express');
const cloudinaryController = require('../controllers/cloudinaryController');
const router = express.Router();
router.post(
  '/upload-cloudinary',
  cloudinaryController.uploadImage,
  cloudinaryController.createCloudinary
);

module.exports = router;
