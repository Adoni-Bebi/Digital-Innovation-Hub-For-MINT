const Opportunity = require('../models/Opportunity');

const INVESTOR_ALLOWED_TYPES = ['internship', 'job'];

// ====================== CREATE (Admin or Investor) ======================
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, type, deadline, link, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const role = req.user.role;
    let finalType = type || 'announcement';
    let status = 'pending';

    if (role === 'investor') {
      if (!INVESTOR_ALLOWED_TYPES.includes(finalType)) {
        return res.status(400).json({
          success: false,
          message: 'Investors can only post internship or job offers',
        });
      }
      status = 'pending';
    } else if (role === 'admin') {
      // Admin posts are published immediately
      status = 'approved';
      if (!finalType) finalType = 'announcement';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only admins and investors can create opportunities',
      });
    }

    const opportunity = await Opportunity.create({
      title: title.trim(),
      description: description.trim(),
      type: finalType,
      deadline: deadline || undefined,
      link: link ? link.trim() : '',
      location: location ? location.trim() : '',
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message:
        status === 'approved'
          ? 'Opportunity published successfully'
          : 'Opportunity submitted. Waiting for MinT admin approval.',
      data: opportunity,
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== LIST ======================
// - All logged-in users: only approved + active
// - Admin with ?all=true: everything
exports.getOpportunities = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (req.user.role === 'admin' && req.query.all === 'true') {
      if (status && status !== 'all') {
        filter.status = status;
      }
    } else {
      filter.status = 'approved';
      filter.isActive = true;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    const opportunities = await Opportunity.find(filter)
      .populate('createdBy', 'fullName email role organization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== GET ONE ======================
exports.getOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'createdBy',
      'fullName email role organization'
    );

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner =
      opportunity.createdBy?._id?.toString() === req.user._id.toString();

    if (opportunity.status !== 'approved' && !isAdmin && !isOwner) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (!opportunity.isActive && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: APPROVE ======================
exports.approveOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    opportunity.status = 'approved';
    opportunity.rejectionReason = undefined;
    opportunity.isActive = true;
    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity approved and published',
      data: opportunity,
    });
  } catch (error) {
    console.error('Approve opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: REJECT ======================
exports.rejectOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const reason =
      (req.body.reason || '').trim() || 'Did not meet platform guidelines';

    opportunity.status = 'rejected';
    opportunity.rejectionReason = reason;
    opportunity.isActive = false;
    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity rejected',
      data: opportunity,
    });
  } catch (error) {
    console.error('Reject opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: UPDATE ======================
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const { title, description, type, deadline, link, location, isActive, status } =
      req.body;

    if (title !== undefined) opportunity.title = title.trim();
    if (description !== undefined) opportunity.description = description.trim();
    if (type !== undefined) opportunity.type = type;
    if (deadline !== undefined) opportunity.deadline = deadline || null;
    if (link !== undefined) opportunity.link = link.trim();
    if (location !== undefined) opportunity.location = location.trim();
    if (isActive !== undefined) opportunity.isActive = isActive;
    if (
      status !== undefined &&
      ['pending', 'approved', 'rejected'].includes(status)
    ) {
      opportunity.status = status;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity updated',
      data: opportunity,
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== ADMIN: DELETE ======================
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted',
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ====================== INVESTOR: MY POSTS ======================
exports.getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    console.error('Get my opportunities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};