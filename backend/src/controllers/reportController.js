const Report = require('../models/Report');
const { bucket } = require('../config/firebase');
const path = require('path');

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, type, description } = req.body;
    
    // Upload to Firebase Storage
    const blob = bucket.file(`reports/${req.user.id}/${Date.now()}_${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      res.status(500).json({ message: error.message });
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      const report = await Report.create({
        patient: req.user.id,
        title,
        type,
        description,
        fileUrl: publicUrl,
        fileName: req.file.originalname,
        uploadedBy: req.user.id
      });

      res.status(201).json({
        success: true,
        report
      });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    // Doctor accessing patient reports
    const reports = await Report.find({ 
      patient: req.params.patientId,
      $or: [
        { isShared: true },
        { 'sharedWith.doctor': req.user.id }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      patient: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete from Firebase Storage
    const fileName = report.fileUrl.split('/').pop();
    await bucket.file(`reports/${req.user.id}/${fileName}`).delete();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
