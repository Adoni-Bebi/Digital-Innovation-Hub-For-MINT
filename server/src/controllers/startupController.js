const Startup = require('../models/Startup');

// ====================== CREATE STARTUP (Founder) ======================
exports.createStartup = async (req, res) => {
  try {
    // Check if founder already has a startup
    const existing = await Startup.findOne({ founder: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have a startup profile',
      });
    }

    const startup = await Startup.create({
      ...req.body,
      founder: req.user._id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Startup submitted successfully. Waiting for MinT verification.',
      data: startup,
    });
  } catch (error) {
    console.error('Create startup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ====================== GET MY STARTUP (Founder) ======================
exports.getMyStartup = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founder: req.user._id });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'No startup found. Please create one.',
      });
    }

    res.status(200).json({ success: true, data: startup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== UPDATE MY STARTUP (Founder) ======================
exports.updateMyStartup = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founder: req.user._id });

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // If already verified, changing important fields may require re-verification (optional logic)
    const updates = req.body;
    Object.assign(startup, updates);

    // Optional: if they edit after verification, set back to pending
    // startup.status = 'pending';

    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup updated successfully',
      data: startup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ====================== GET ALL VERIFIED STARTUPS (Public Directory) ======================
exports.getVerifiedStartups = async (req, res) => {
  try {
    const startups = await Startup.find({ status: 'verified' })
      .sort({ verifiedAt: -1 })
      .select('-rejectionReason');

    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET SINGLE STARTUP ======================
exports.getStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    // Only show verified startups to public, or owner/admin
    if (
      startup.status !== 'verified' &&
      (!req.user ||
        (req.user.role !== 'admin' && startup.founder.toString() !== req.user._id.toString()))
    ) {
      return res.status(403).json({ success: false, message: 'This startup is not public yet' });
    }

    res.status(200).json({ success: true, data: startup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: GET PENDING STARTUPS ======================
exports.getPendingStartups = async (req, res) => {
  try {
    const startups = await Startup.find({ status: 'pending' })
      .populate('founder', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: APPROVE STARTUP ======================
exports.approveStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    startup.status = 'verified';
    startup.verifiedAt = new Date();
    startup.rejectionReason = undefined;
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup approved and verified',
      data: startup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: REJECT STARTUP ======================
exports.rejectStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    startup.status = 'rejected';
    startup.rejectionReason = req.body.reason || 'Did not meet verification criteria';
    await startup.save();

    res.status(200).json({
      success: true,
      message: 'Startup rejected',
      data: startup,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// ====================== ADMIN: DASHBOARD STATS ======================
exports.getAdminStats = async (req, res) => {
  try {
    const [total, verified, pending, rejected] = await Promise.all([
      Startup.countDocuments(),
      Startup.countDocuments({ status: 'verified' }),
      Startup.countDocuments({ status: 'pending' }),
      Startup.countDocuments({ status: 'rejected' }),
    ]);

    // Count investors (users with role investor)
    const User = require('../models/User');
    const investors = await User.countDocuments({ role: 'investor' });

    res.status(200).json({
      success: true,
      data: {
        totalStartups: total,
        verified,
        pending,
        rejected,
        totalInvestors: investors,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
// ====================== PUBLIC: HOME PAGE STATS ======================
exports.getPublicStats = async (req, res) => {
  try {
    const User = require('../models/User');

    const [verified, totalInvestors, totalStartups] = await Promise.all([
      Startup.countDocuments({ status: 'verified' }),
      User.countDocuments({ role: 'investor' }),
      Startup.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        verifiedStartups: verified,
        totalInvestors,
        totalStartups,
        sectorsCovered: 7, // fixed for now
      },
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};