const mongoose = require('mongoose');
const { MEMBER_STATUS } = require('../constants/memberStatus');
const { config } = require('../config/env');

const memberSchema = new mongoose.Schema(
  {
    membershipId: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 25,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    status: {
      type: String,
      enum: Object.values(MEMBER_STATUS),
      default: MEMBER_STATUS.ACTIVE,
    },
    activeBorrowLimit: {
      type: Number,
      min: 1,
      max: 20,
      default: config.defaultBorrowLimit,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

memberSchema.pre('validate', function assignMembershipId(next) {
  if (!this.membershipId) {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    this.membershipId = `LIB-${Date.now()}-${randomPart}`;
  }

  next();
});

memberSchema.index({ membershipId: 1 }, { unique: true });
memberSchema.index({ email: 1 }, { unique: true });
memberSchema.index({ status: 1 });

memberSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Member', memberSchema);
