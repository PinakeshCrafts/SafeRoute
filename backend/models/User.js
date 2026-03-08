import mongoose from 'mongoose';

const emailSchema = {
  type: String,
  trim: true,
  lowercase: true,
  match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
};

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 32, unique: true },
    passwordHash: { type: String, required: true },
    emergencyContacts: {
      type: [emailSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 3,
        message: 'Emergency contacts must be at most 3 emails',
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

