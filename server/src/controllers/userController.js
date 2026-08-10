const User = require('../models/User');
const Startup = require('../models/Startup');
const AccessRequest = require('../models/AccessRequest');
const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');

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
      total: 0,
    };

    counts.forEach((c) => {
      if (c._id && roleCounts[c._id] !== undefined) {
        roleCounts[c._id] = c.count;
      }
    });

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

// ====================== ADMIN: DELETE USER ======================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Cannot delete the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin account',
        });
      }
    }

    // ----- Clean related data -----

    // If founder: remove startup, documents, access requests for that startup
    if (user.role === 'founder') {
      const startup = await Startup.findOne({ founder: user._id });

      if (startup) {
        // Delete documents from Cloudinary + DB
        const docs = await Document.find({ startup: startup._id });
        for (const doc of docs) {
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
              resource_type: doc.resourceType || 'raw',
            });
          } catch (cloudErr) {
            console.error('Cloudinary delete warning:', cloudErr.message);
          }
        }
        await Document.deleteMany({ startup: startup._id });

        // Delete access requests for this startup
        await AccessRequest.deleteMany({ startup: startup._id });

        // Delete startup
        await Startup.deleteOne({ _id: startup._id });
      }
    }

    // If investor: remove their access requests
    if (user.role === 'investor') {
      await AccessRequest.deleteMany({ investor: user._id });
    }

    // Delete the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: `User "${user.fullName}" deleted successfully`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};