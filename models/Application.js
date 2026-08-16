// models/Application.js
import mongoose from 'mongoose';

const CofounderSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: String,
  phone: String,
});

const ApplicationSchema = new mongoose.Schema({
  // Applicant Details
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  otherState: String,

  // Academic/Professional Background
  currentStatus: { type: String, required: true },
  otherStatus: String,
  institution: { type: String, required: true },
  course: String,
  yearOfStudy: String,
  otherYear: String,

  // Startup Idea Details
  startupName: String,
  sector: { type: String, required: true },
  otherSector: String,
  ideaDescription: { type: String, required: true },
  problemSolving: { type: String, required: true },
  targetCustomers: { type: String, required: true },
  ideaStage: { type: String, required: true },

  // Team Information
  numTeamMembers: String,
  cofounders: [CofounderSchema],

  // Program Commitment
  willingToAttend: { type: String, required: true },
  committedToWork: { type: String, required: true },

  // Additional Information
  pitchDeckUrl: String,
  socialMedia: String,

  // Declaration
  declaration: { type: Boolean, required: true },
  signature: { type: String, required: true },
  signatureDate: { type: Date, required: true },

  // Metadata
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'submitted' },
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);