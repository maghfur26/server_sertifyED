import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  certificateHash: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
  },
  recipientAddress: {
    type: String,
    required: true,
  },
  issuerName: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "issued", "revoked"],
  },
  OrganizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  metadata: {
    grade: String,
    credits: Number,
    institution: String,
    certificateType: String,
    description: String,
  },
  qrCodeUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// update timestamps before saving
certificateSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
certificateSchema.index({ recipientEmail: 1, status: 1 });
certificateSchema.index({ issuerId: 1, createAt: -1 });
certificateSchema.index({ createAt: -1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
