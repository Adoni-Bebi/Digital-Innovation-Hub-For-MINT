const AccessRequest = require('../models/AccessRequest');
const Startup = require('../models/Startup');

// ====================== INVESTOR: CREATE REQUEST ======================
exports.createRequest = async (req, res) => {
  try {
    const { startupId, message, ticketSize, focus } = req.body;

    if (!startupId) {
      return res.status(400).json({ success: false, message: 'Startup ID is required' });
    }

    // Check startup exists and is verified
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    if (startup.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Can only request access to verified startups' });
    }

    // Check if request already exists
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
      ticketSize,
      focus: focus || [],
    });

    // Increment request count on startup
    await Startup.findByIdAndUpdate(startupId, { $inc: { requestCount: 1 } });

    const populated = await AccessRequest.findById(request._id)
      .populate('startup', 'companyName logo sector fundingStage')
      .populate('investor', 'fullName email organization');

    res.status(201).json({
      success: true,
      message: 'Access request sent successfully',
      data: populated,
    });
  } catch (error) {
    console.error('Create request error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already requested access to this startup' });
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
    // Find the founder's startup
    const startup = await Startup.findOne({ founder: req.user._id });
    if (!startup) {
      return res.status(404).json({ success: false, message: 'You do not have a startup yet' });
    }

    const requests = await AccessRequest.find({ startup: startup._id })
      .populate('investor', 'fullName email organization')
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
    const request = await AccessRequest.findById(req.params.id).populate('startup');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify the founder owns this startup
    if (request.startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'approved';
    await request.save();

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
    const request = await AccessRequest.findById(req.params.id).populate('startup');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    request.status = 'denied';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Access request denied',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};