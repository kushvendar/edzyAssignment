// models/student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  referralCode: { type: String, unique: true, sparse: true },
  totalSpent: { type: Number, default: 0 },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

function randomReferral() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// validating student if new or older

studentSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  if (this.referralCode) return next();

  const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

  let code;
// running loop again just to be more randomize the referral code
  for (let i = 0; i < 5; i++) {
    code = 'EDZ' + randomReferral();
    const exists = await Student.exists({ referralCode: code });
    if (!exists) {
      this.referralCode = code;
      return next();
    }
  }
  // If student is still not unique, return error
  return next(new Error('Failed to generate unique referral code, try again'));
});

module.exports = mongoose.model('Student', studentSchema);
