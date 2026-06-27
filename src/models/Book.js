const mongoose = require('mongoose');
const { BOOK_STATUS } = require('../constants/bookStatus');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 180,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    isbn: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    publishedYear: {
      type: Number,
      min: 1000,
      max: 9999,
    },
    language: {
      type: String,
      trim: true,
      default: 'English',
      maxlength: 60,
    },
    shelfLocation: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default() {
        return this.totalCopies;
      },
      validate: {
        validator(value) {
          const totalCopies = this.totalCopies ?? (this.get && this.get('totalCopies'));
          return totalCopies === undefined || value <= totalCopies;
        },
        message: 'Available copies cannot be greater than total copies',
      },
    },
    status: {
      type: String,
      enum: Object.values(BOOK_STATUS),
      default: BOOK_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookSchema.index({ isbn: 1 }, { unique: true });
bookSchema.index({ title: 'text', author: 'text', category: 'text' });
bookSchema.index({ category: 1, status: 1 });

bookSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Book', bookSchema);
