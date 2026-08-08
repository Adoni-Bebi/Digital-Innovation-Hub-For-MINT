const User = require('../models/User');

// ====================== ADMIN: GET ALL USERS ======================
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { organization: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    const counts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const roleCounts = {
      founder: 0,
      investor: 0,
      admin: 0,
      total: users.length,
    };

    counts.forEach((c) => {
      if (c._id && roleCounts[c._id] !== undefined) {
        roleCounts[c._id] = c.count;
      }
    });

    // total should be all users in DB, not just filtered
    const totalAll = await User.countDocuments();
    roleCounts.total = totalAll;

    res.status(200).json({
      success: true,
      count: users.length,
      roleCounts,
      data: users.map((u) => ({
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        companyName: u.companyName || '',
        organization: u.organization || '',
        investmentRange: u.investmentRange || '',
        focus: u.focus || [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};