const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    logo: {
      type: String,
      default: '🚀',
    },
    oneLineDescription: {
      type: String,
      required: [true, 'One line description is required'],
      maxlength: 200,
    },
    sector: {
      type: String,
      enum: ['FinTech', 'AgriTech', 'EdTech', 'HealthTech', 'LogisticsTech', 'CleanTech', 'Other'],
      required: true,
    },
    fundingStage: {
      type: String,
      enum: ['Idea', 'Pre-seed', 'Seed', 'Series A'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    teamSize: {
      type: Number,
      default: 1,
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
    },
    solutionStatement: {
      type: String,
      required: [true, 'Solution statement is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Startup', startupSchema);