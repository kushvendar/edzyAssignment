// models/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  snack: { type: mongoose.Schema.Types.ObjectId, ref: 'Snack', required: true },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: 'quantity must be an integer'
    }
  },
  payableAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Validiating an order
orderSchema.pre('validate', async function (next) {
  try {
    // quantity checks if client is sending an not a number or no quantity at all 
    if (this.quantity === undefined || this.quantity === null) {
      return next(new mongoose.Error.ValidationError(this).addError('quantity', new mongoose.Error.ValidatorError({ message: 'quantity is required' })));
    }
    if (!Number.isInteger(this.quantity) || this.quantity < 1 || this.quantity > 5) {
      return next(new mongoose.Error.ValidationError(this).addError('quantity', new mongoose.Error.ValidatorError({ message: 'quantity must be an integer between 1 and 5' })));
    }

    // Getting snack to compute price
    const Snack = mongoose.model('Snack');
    const snackDoc = await Snack.findById(this.snack).select('price');
    if (!snackDoc) {
      return next(new mongoose.Error.ValidationError(this).addError('snack', new mongoose.Error.ValidatorError({ message: 'snack not found' })));
    }

    this.payableAmount = snackDoc.price * this.quantity;
    return next();
  } catch (err) {
    return next(err);
  }
});


// if the order is valid increment the order quantity in snack model by 1 and also update the student totalSpent and orders
orderSchema.post('save', async function (doc) {
  try {
    const Snack = mongoose.model('Snack');
    const Student = mongoose.model('Student');

    // increment Snack.ordersCount by 1
    await Snack.findByIdAndUpdate(doc.snack, { $inc: { ordersCount: 1 } });

    // push order into student.orders and increment totalSpent
    await Student.findByIdAndUpdate(doc.student, {
      $push: { orders: doc._id },
      $inc: { totalSpent: doc.payableAmount }
    });
  } catch (err) {
    console.error('Error in order post-save hook:', err);
  }
});

module.exports = mongoose.model('Order', orderSchema);
