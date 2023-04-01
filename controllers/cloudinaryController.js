const cloudinary = require('../utils/cloudinary');
const uploader = require('../utils/multer');
const catchAsync = require('../utils/catchAsync');

exports.uploadImage = uploader.single('upload');
exports.createCloudinary = catchAsync(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  return res.status(200).json({
    uploaded: true,
    url: result.secure_url,
  });
});
