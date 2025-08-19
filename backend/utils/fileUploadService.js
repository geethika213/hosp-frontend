const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types for medical documents
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: fileFilter
});

class FileUploadService {
  async uploadToCloudinary(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'healthcare-assistant',
        resource_type: 'auto',
        ...options
      });

      // Delete local file after successful upload
      fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      // Clean up local file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async uploadMedicalDocument(file, userId, documentType) {
    try {
      const uploadResult = await this.uploadToCloudinary(file.path, {
        folder: `healthcare-assistant/medical-docs/${userId}`,
        resource_type: 'auto'
      });

      return {
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        fileType: file.mimetype,
        fileSize: file.size,
        cloudinaryId: uploadResult.publicId,
        documentType,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Medical document upload error:', error);
      throw error;
    }
  }

  async uploadProfileImage(file, userId) {
    try {
      const uploadResult = await this.uploadToCloudinary(file.path, {
        folder: `healthcare-assistant/profiles/${userId}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };
    } catch (error) {
      console.error('Profile image upload error:', error);
      throw error;
    }
  }

  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  // Middleware for handling file uploads
  uploadMiddleware() {
    return upload;
  }

  // Validate file before upload
  validateFile(file, maxSize = 10 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return errors;
    }

    if (file.size > maxSize) {
      errors.push(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only images, PDFs, and documents are allowed.');
    }

    return errors;
  }

  // Generate secure file URL with expiration
  generateSecureUrl(publicId, expirationMinutes = 60) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000) + (expirationMinutes * 60);
      
      return cloudinary.utils.private_download_url(publicId, 'auto', {
        expires_at: timestamp
      });
    } catch (error) {
      console.error('Error generating secure URL:', error);
      throw error;
    }
  }
}

module.exports = new FileUploadService();
