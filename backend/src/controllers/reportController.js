const Report = require('../models/Report');
const path = require('path');
const fs = require('fs-extra');

// Upload report (Local Storage)
exports.uploadReport = async (req, res) => {
  try {
    console.log('=== UPLOAD REPORT STARTED ===');
    console.log('User:', req.user?.id, req.user?.email);
    console.log('Body:', req.body);
    console.log('File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename
    } : 'NO FILE RECEIVED');

    // Check if file exists
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ 
        success: false,
        message: 'Please upload a file. Make sure to select a file before submitting.' 
      });
    }

    const { title, type, description } = req.body;

    // Validate title
    if (!title || title.trim() === '') {
      console.error('No title provided');
      await fs.remove(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Title is required. Please provide a title for your report.'
      });
    }

    // Create relative URL for file access
    const relativePath = `/uploads/reports/${req.user.id}/${req.file.filename}`;
    
    // Create report record
    const report = await Report.create({
      patient: req.user.id,
      title: title.trim(),
      type: type || 'other',
      description: description || '',
      fileUrl: relativePath,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      storageType: 'local',
      uploadedBy: req.user.id
    });

    console.log('Report created:', report._id);

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      report: {
        ...report.toObject(),
        downloadUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${relativePath}`
      }
    });
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error(error);
    
    // Clean up file if exists
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
        console.log('Cleaned up file:', req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload report. Please try again.'
    });
  }
};

// Get my reports
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const reportsWithUrl = reports.map(report => ({
      ...report,
      downloadUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${report.fileUrl}`
    }));

    res.json({
      success: true,
      count: reports.length,
      reports: reportsWithUrl
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get patient reports (for doctors)
exports.getPatientReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      patient: req.params.patientId,
      $or: [
        { isShared: true },
        { 'sharedWith.doctor': req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    const reportsWithUrl = reports.map(report => ({
      ...report,
      downloadUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${report.fileUrl}`
    }));

    res.json({
      success: true,
      count: reports.length,
      reports: reportsWithUrl
    });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Share report with doctor
exports.shareReport = async (req, res) => {
  try {
    const { doctorId } = req.body;
    
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { 
        $set: { isShared: true },
        $push: { sharedWith: { doctor: doctorId } }
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report shared successfully',
      report
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      patient: req.user.id
    });

    if (!report) {
      return res.status(404).json({ 
        success: false,
        message: 'Report not found or access denied' 
      });
    }

    // Delete file from local storage
    if (report.storageType === 'local') {
      const filePath = path.join(__dirname, '../..', report.fileUrl);
      try {
        await fs.remove(filePath);
        console.log('File deleted:', filePath);
      } catch (fileError) {
        console.error('File deletion error:', fileError.message);
      }
    }

    await Report.deleteOne({ _id: report._id });

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
