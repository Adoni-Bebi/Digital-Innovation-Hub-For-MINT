const AccessRequest = require('../models/AccessRequest');
const Startup = require('../models/Startup');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// ====================== INVESTOR: CREATE REQUEST ======================
exports.createRequest = async (req, res) => {
  try {
    const { startupId, message, investmentRange, focus } = req.body;

    if (!startupId) {
      return res.status(400).json({ success: false, message: 'Startup ID is required' });
    }

    const startup = await Startup.findById(startupId).populate('founder', 'fullName email');
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    if (startup.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Can only request access to verified startups',
      });
    }

    const existing = await AccessRequest.findOne({
      startup: startupId,
      investor: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.status} request for this startup`,
      });
    }

    const request = await AccessRequest.create({
      startup: startupId,
      investor: req.user._id,
      message,
      ticketSize: investmentRange || req.user.investmentRange,
      focus: focus || req.user.focus || [],
    });

    await Startup.findByIdAndUpdate(startupId, { $inc: { requestCount: 1 } });

    const populated = await AccessRequest.findById(request._id)
      .populate('startup', 'companyName logo sector fundingStage')
      .populate('investor', 'fullName email organization investmentRange focus');

    // ===== EMAIL FOUNDER =====
    if (startup.founder?.email) {
      await sendEmail({
        to: startup.founder.email,
        subject: `New Data Room Request – ${startup.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">New Access Request</h2>
            <p>Hello ${startup.founder.fullName},</p>
            <p>You have a new Data Room access request for <strong>${startup.companyName}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Investor</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${req.user.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Organization</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${req.user.organization || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Investment range</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${req.user.investmentRange || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Focus</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${(req.user.focus || []).join(', ') || '—'}</td>
              </tr>
            </table>
            <p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/founder"
                 style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Review Request
              </a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 30px;">
              Digital Innovation Hub · Ministry of Innovation and Technology
            </p>
          </div>
        `,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Access request sent successfully',
      data: populated,
    });
  } catch (error) {
    console.error('Create request error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already requested access to this startup',
      });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ====================== INVESTOR: GET MY REQUESTS ======================
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find({ investor: req.user._id })
      .populate('startup', 'companyName logo sector fundingStage location status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== FOUNDER: GET INCOMING REQUESTS ======================
exports.getIncomingRequests = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founder: req.user._id });
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a startup yet',
      });
    }

    const requests = await AccessRequest.find({ startup: startup._id })
      .populate('investor', 'fullName email organization investmentRange focus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== FOUNDER: APPROVE REQUEST ======================
exports.approveRequest = async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id)
      .populate('startup', 'companyName founder')
      .populate('investor', 'fullName email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'approved';
    await request.save();

    // ===== EMAIL INVESTOR =====
    if (request.investor?.email) {
      await sendEmail({
        to: request.investor.email,
        subject: `Access Approved – ${request.startup.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d9488;">Access Request Approved</h2>
            <p>Hello ${request.investor.fullName},</p>
            <p>
              Great news! Your Data Room access request for
              <strong>${request.startup.companyName}</strong> has been <strong>approved</strong>.
            </p>
            <p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/directory/${request.startup._id}"
                 style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Startup
              </a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 30px;">
              Digital Innovation Hub · Ministry of Innovation and Technology
            </p>
          </div>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access request approved',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== FOUNDER: DENY REQUEST ======================
exports.denyRequest = async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id)
      .populate('startup', 'companyName founder')
      .populate('investor', 'fullName email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'denied';
    await request.save();

    // ===== EMAIL INVESTOR =====
    if (request.investor?.email) {
      await sendEmail({
        to: request.investor.email,
        subject: `Access Update – ${request.startup.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #64748b;">Access Request Update</h2>
            <p>Hello ${request.investor.fullName},</p>
            <p>
              Your Data Room access request for
              <strong>${request.startup.companyName}</strong> was not approved at this time.
            </p>
            <p>
              You can continue exploring other verified startups on the platform.
            </p>
            <p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/directory"
                 style="background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Browse Directory
              </a>
            </p>
            <p style="color: #666; font-size: 13px; margin-top: 30px;">
              Digital Innovation Hub · Ministry of Innovation and Technology
            </p>
          </div>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access request denied',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};