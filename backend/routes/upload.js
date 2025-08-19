const express = require('express');
const { body, validationResult } = require('express-validator');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const fileUploadService = require('../utils/fileUploadService');

const router = express.Router();

// @desc    Upload profile image
// @route   POST /api/upload/profile-image
// @access  Private
router.post('/profile-image', protect, (req, res) => {
  const upload = fileUploadService.uploadMiddleware().single('profileImage');
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const validationErrors = fileUploadService.validateFile(req.file, 5 * 1024 * 1024); // 5MB for profile images
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: validationErrors
        });
      }

      const uploadResult = await fileUploadService.uploadProfileImage(req.file, req.user._id);

      // Update user profile with new avatar
      await User.findByIdAndUpdate(req.user._id, {
        avatar: uploadResult.url
      });

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        }
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading profile image'
      });
    }
  });
});

// @desc    Upload medical document
// @route   POST /api/upload/medical-document
// @access  Private
router.post('/medical-document', protect, (req, res) => {
  const upload = fileUploadService.uploadMiddleware().array('documents', 5);
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const { recordType, title, description, patientId } = req.body;

      // Validate required fields
      if (!recordType || !title) {
        return res.status(400).json({
          success: false,
          message: 'Record type and title are required'
        });
      }

      // Determine patient ID (doctors can upload for patients, patients for themselves)
      let targetPatientId = req.user._id;
      if (req.user.role === 'doctor' && patientId) {
        targetPatientId = patientId;
      }

      const uploadedFiles = [];
      
      for (const file of req.files) {
        const validationErrors = fileUploadService.validateFile(file);
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            message: `File validation failed for ${file.originalname}`,
            errors: validationErrors
          });
        }

        const uploadResult = await fileUploadService.uploadMedicalDocument(
          file, 
          targetPatientId, 
          recordType
        );
        uploadedFiles.push(uploadResult);
      }

      // Create medical record
      const medicalRecord = new MedicalRecord({
        patient: targetPatientId,
        doctor: req.user._id,
        recordType,
        title,
        description,
        attachments: uploadedFiles.map(file => ({
          ...file,
          uploadedBy: req.user._id
        }))
      });

      await medicalRecord.save();

      res.json({
        success: true,
        message: 'Medical documents uploaded successfully',
        data: {
          recordId: medicalRecord._id,
          uploadedFiles: uploadedFiles.length
        }
      });
    } catch (error) {
      console.error('Medical document upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading medical documents'
      });
    }
  });
});

// @desc    Get uploaded files for a medical record
// @route   GET /api/upload/medical-record/:recordId/files
// @access  Private
router.get('/medical-record/:recordId/files', protect, async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.recordId);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check access permissions
    const hasAccess = medicalRecord.patient.toString() === req.user._id.toString() ||
                     medicalRecord.doctor.toString() === req.user._id.toString() ||
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this medical record'
      });
    }

    res.json({
      success: true,
      data: medicalRecord.attachments
    });
  } catch (error) {
    console.error('Get medical record files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching medical record files'
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/file/:recordId/:fileId
// @access  Private
router.delete('/file/:recordId/:fileId', protect, async (req, res) => {
  try {
    const medicalRecord = await MedicalRecord.findById(req.params.recordId);

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Check permissions (only doctor who uploaded or admin can delete)
    const hasPermission = medicalRecord.doctor.toString() === req.user._id.toString() ||
                         req.user.role === 'admin';

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the uploading doctor or admin can delete files.'
      });
    }

    const fileIndex = medicalRecord.attachments.findIndex(
      file => file._id.toString() === req.params.fileId
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = medicalRecord.attachments[fileIndex];

    // Delete from Cloudinary if it has a cloudinary ID
    if (file.cloudinaryId) {
      await fileUploadService.deleteFile(file.cloudinaryId);
    }

    // Remove from medical record
    medicalRecord.attachments.splice(fileIndex, 1);
    await medicalRecord.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting file'
    });
  }
});

// @desc    Generate secure download URL
// @route   GET /api/upload/secure-url/:publicId
// @access  Private
router.get('/secure-url/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { expirationMinutes = 60 } = req.query;

    // Verify user has access to this file
    const medicalRecord = await MedicalRecord.findOne({
      'attachments.cloudinaryId': publicId,
      $or: [
        { patient: req.user._id },
        { doctor: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    });

    if (!medicalRecord && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this file'
      });
    }

    const secureUrl = fileUploadService.generateSecureUrl(publicId, parseInt(expirationMinutes));

    res.json({
      success: true,
      data: {
        secureUrl,
        expiresIn: `${expirationMinutes} minutes`
      }
    });
  } catch (error) {
    console.error('Generate secure URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating secure URL'
    });
  }
});

module.exports = router;
