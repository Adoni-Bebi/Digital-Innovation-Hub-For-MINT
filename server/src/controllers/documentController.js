const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Startup = require('../models/Startup');
const AccessRequest = require('../models/AccessRequest');

// Check if user can access startup documents
async function canAccessDocuments(user, startupId) {
  const startup = await Startup.findById(startupId);
  if (!startup) return { allowed: false, startup: null, reason: 'Startup not found' };

  // Founder owns it
  if (startup.founder.toString() === user._id.toString()) {
    return { allowed: true, startup, role: 'founder' };
  }

  // Admin can view
  if (user.role === 'admin') {
    return { allowed: true, startup, role: 'admin' };
  }

  // Investor needs approved access request
  if (user.role === 'investor') {
    const request = await AccessRequest.findOne({
      startup: startupId,
      investor: user._id,
      status: 'approved',
    });
    if (request) {
      return { allowed: true, startup, role: 'investor' };
    }
    return { allowed: false, startup, reason: 'Access not approved' };
  }

  return { allowed: false, startup, reason: 'Not authorized' };
}

// ====================== UPLOAD (Founder) ======================
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
      // cleanup uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    const startup = await Startup.findOne({ founder: req.user._id });
    if (!startup) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'You do not have a startup yet' });
    }

    const doc = await Document.create({
      startup: startup._id,
      title: title.trim(),
      originalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: doc,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};

// ====================== LIST DOCS FOR MY STARTUP (Founder) ======================
exports.getMyDocuments = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founder: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'No startup found' });
    }

    const docs = await Document.find({ startup: startup._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== LIST DOCS FOR A STARTUP (with access control) ======================
exports.getStartupDocuments = async (req, res) => {
  try {
    const { startupId } = req.params;
    const access = await canAccessDocuments(req.user, startupId);

    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.reason || 'Not authorized to view documents',
      });
    }

    const docs = await Document.find({ startup: startupId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== DOWNLOAD ======================
exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const access = await canAccessDocuments(req.user, doc.startup);
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: access.reason || 'Not authorized',
      });
    }

    const filePath = path.join(__dirname, '../uploads', doc.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File missing on server' });
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(doc.originalName)}"`
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== DELETE (Founder only) ======================
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const startup = await Startup.findById(doc.startup);
    if (!startup || startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const filePath = path.join(__dirname, '../uploads', doc.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await doc.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};