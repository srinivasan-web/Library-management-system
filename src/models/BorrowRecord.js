const mongoose = require('mongoose');
const { BORROW_STATUS } = require('../constants/borrowStatus');

const borrowRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    borrowedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(BORROW_STATUS),
      default: BORROW_STATUS.ACTIVE,
    },
    fineAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

borrowRecordSchema.index(
  { member: 1, book: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: BORROW_STATUS.ACTIVE },
  }
);
borrowRecordSchema.index({ book: 1, status: 1 });
borrowRecordSchema.index({ member: 1, status: 1 });
borrowRecordSchema.index({ dueDate: 1, status: 1 });

borrowRecordSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
