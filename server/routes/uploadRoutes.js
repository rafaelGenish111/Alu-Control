const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  // Cloudinary returns the public URL of the uploaded image
  res.json({ url: req.file.path });
});

module.exports = router;