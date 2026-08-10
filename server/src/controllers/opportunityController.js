const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// ====================== ADMIN: CREATE ======================
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, type, deadline, link, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const opportunity = await Opportunity.create({
      title: title.trim(),
      description: description.trim(),
      type: type || 'announcement',
      deadline: deadline || undefined,
      link: link ? link.trim() : '',
      location: location ? location.trim() : '',
      createdBy: req.user._id,
    });

    // Email all citizens (do not block response)
    notifyCitizens(opportunity).catch((err) =>
      console.error('Citizen notify error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully',
      data: opportunity,
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

async function notifyCitizens(opportunity) {
  const citizens = await User.find({ role: 'citizen' }).select('email fullName');
  if (!citizens.length) return;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const deadlineText = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString()
    : 'No deadline';

  const subject = `New opportunity: ${opportunity.title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">New opportunity on Digital Innovation Hub</h2>
      <p><strong>Title:</strong> ${escapeHtml(opportunity.title)}</p>
      <p><strong>Type:</strong> ${escapeHtml(opportunity.type)}</p>
      <p><strong>Deadline:</strong> ${escapeHtml(deadlineText)}</p>
      ${
        opportunity.location
          ? `<p><strong>Location:</strong> ${escapeHtml(opportunity.location)}</p>`
          : ''
      }
      <p style="white-space: pre-line; margin-top: 12px;">${escapeHtml(
        opportunity.description
      )}</p>
      ${
        opportunity.link
          ? `<p style="margin-top: 12px;"><a href="${escapeHtml(
              opportunity.link
            )}" target="_blank" rel="noopener noreferrer">Open application / more info</a></p>`
          : ''
      }
      <p style="margin-top: 16px;">
        <a href="${clientUrl}/opportunities" target="_blank" rel="noopener noreferrer">
          View in portal
        </a>
      </p>
      <p style="margin-top: 20px; color: #64748b; font-size: 13px;">
        — Digital Innovation Hub for MinT
      </p>
    </div>
  `;

  for (const citizen of citizens) {
    try {
      await sendEmail({
        to: citizen.email,
        subject,
        html,
      });
    } catch (err) {
      console.error(`Failed to email ${citizen.email}:`, err.message);
    }
  }
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ====================== LIST (logged-in users) ======================
exports.getOpportunities = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };

    if (req.user.role === 'admin' && req.query.all === 'true') {
      delete filter.isActive;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    const opportunities = await Opportunity.find(filter)
      .populate('createdBy', 'fullName email')
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
      'fullName email'
    );

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    if (!opportunity.isActive && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
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

    const { title, description, type, deadline, link, location, isActive } =
      req.body;

    if (title !== undefined) opportunity.title = title.trim();
    if (description !== undefined) opportunity.description = description.trim();
    if (type !== undefined) opportunity.type = type;
    if (deadline !== undefined) opportunity.deadline = deadline || null;
    if (link !== undefined) opportunity.link = link.trim();
    if (location !== undefined) opportunity.location = location.trim();
    if (isActive !== undefined) opportunity.isActive = isActive;

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