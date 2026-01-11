const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // זיהוי הפורמט
    let format = file.mimetype.split('/')[1];
    if (file.mimetype === 'application/pdf') {
      format = 'pdf';
    }

    // זיהוי סוג המשאב - image או video
    let resourceType = 'image';
    if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }

    return {
      folder: 'glass_dynamic_uploads',
      format: format,
      resource_type: resourceType
    };
  },
});

module.exports = { cloudinary, storage };