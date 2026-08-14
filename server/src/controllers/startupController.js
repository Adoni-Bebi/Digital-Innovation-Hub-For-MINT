const Startup = require('../models/Startup');
const sendEmail = require('../utils/sendEmail');

// ====================== CREATE STARTUP (Founder) ======================
exports.createStartup = async (req, res) => {
  try {
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

    Object.assign(startup, req.body);
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

    if (
      startup.status !== 'verified' &&
      (!req.user ||
        (req.user.role !== 'admin' &&
          startup.founder.toString() !== req.user._id.toString()))
    ) {
      return res.status(403).json({
        success: false,
        message: 'This startup is not public yet',
      });
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
    const startup = await Startup.findById(req.params.id).populate(
      'founder',
      'fullName email'
    );

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    const founderEmail = startup.founder?.email;
    const founderName = startup.founder?.fullName || 'Founder';
    const companyName = startup.companyName;
    const startupId = startup._id;

    startup.status = 'verified';
    startup.verifiedAt = new Date();
    startup.rejectionReason = undefined;
    await startup.save();

    if (founderEmail) {
      await sendEmail({
        to: founderEmail,
        subject: `MinT Verified – ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">Your Startup is MinT Verified</h2>
            <p>Hello ${founderName},</p>
            <p>
              Congratulations! <strong>${companyName}</strong> has been reviewed and
              <strong>verified</strong> by the Ministry of Innovation and Technology.
            </p>
            <p>Your startup is now visible in the public directory and open to investor interest.</p>
            <p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/directory/${startupId}"
                 style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Public Profile
              </a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 30px;">
              Digital Innovation Hub · Ministry of Innovation and Technology
            </p>
          </div>
        `,
      });
    } else {
      console.log('Approve email skipped: founder email missing');
    }

    res.status(200).json({
      success: true,
      message: 'Startup approved and verified',
      data: startup,
    });
  } catch (error) {
    console.error('Approve startup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: REJECT STARTUP ======================
exports.rejectStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id).populate(
      'founder',
      'fullName email'
    );

    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    const founderEmail = startup.founder?.email;
    const founderName = startup.founder?.fullName || 'Founder';
    const companyName = startup.companyName;
    const reason = req.body.reason || 'Did not meet verification criteria';

    startup.status = 'rejected';
    startup.rejectionReason = reason;
    await startup.save();

    if (founderEmail) {
      await sendEmail({
        to: founderEmail,
        subject: `Verification Update – ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #64748b;">Startup Verification Update</h2>
            <p>Hello ${founderName},</p>
            <p>
              After review, <strong>${companyName}</strong> was not approved for
              MinT verification at this time.
            </p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>You can update your profile and resubmit for review.</p>
            <p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/founder"
                 style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 30px;">
              Digital Innovation Hub · Ministry of Innovation and Technology
            </p>
          </div>
        `,
      });
    } else {
      console.log('Reject email skipped: founder email missing');
    }

    res.status(200).json({
      success: true,
      message: 'Startup rejected',
      data: startup,
    });
  } catch (error) {
    console.error('Reject startup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: DELETE STARTUP ======================
exports.deleteStartup = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    await startup.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Startup deleted successfully',
    });
  } catch (error) {
    console.error('Delete startup error:', error);
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

// ====================== ADMIN: LIST STARTUPS BY STATUS ======================
exports.getAdminStartups = async (req, res) => {
  try {
    const { status, search, sector } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (sector) filter.sector = sector;
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { oneLineDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const startups = await Startup.find(filter)
      .populate('founder', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: startups.length,
      data: startups,
    });
  } catch (error) {
    console.error('Admin startups error:', error);
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
        sectorsCovered: 7,
      },
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};