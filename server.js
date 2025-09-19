const express = require('express')
const mongoose = require('mongoose')

const Student = require('./models/student');
const Snack = require('./models/snack');
const Order = require('./models/order');
const { title } = require('process');


const app = express()
app.use(express.json())


// mongo db connection






//  POST /seed Create initial snacks for testing. injecting data for testing


app.post('/seed', async (req, res) => {
  try {
    const snacks = [
      { title: 'Samosa', price: 15 },
      { title: 'Idli', price: 25 },
      { title: 'Veg Puff', price: 30 },
      { title: 'Macroni', price: 40 },
      { title: 'Chilli potato', price: 50 },
    ];
    // Upsert to avoid duplicates entries on repeated seed calls
    const results = [];
    for (const s of snacks) {
      const doc = await Snack.findOneAndUpdate(
        { title: s.title },
        { $set: s },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(doc);
    }
    return res.json({ seeded: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to seed snacks' });
  }
});




// POST /students  Body: { name: "Aarav" }  referralCode will be auto-generated in pre-save hook.

app.post('/students', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const student = new Student({ name });
    await student.save();
    return res.status(201).json(student);

  } catch (err) {
    console.error(err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.referralCode) {
      return res.status(500).json({ error: 'Referral code collision, try again' });
    }
    return res.status(400).json({ error: err.message });
  }
});

// POST /orders  Body: { studentId, snackId, quantity } pre-validate will check & compute payableAmount. post-save will update student & snack.

app.post('/orders', async (req, res) => {
  try {
    const { studentId, snackId, quantity } = req.body;
    if (!studentId || !snackId || quantity === undefined) {
      return res.status(400).json({ error: 'studentId, snackId and quantity are required' });
    }

    const order = new Order({
      student: studentId,
      snack: snackId,
      quantity
    });

    const saved = await order.save();
    // Populate the saved order for response (with snack title)
    const populated = await Order.findById(saved._id)
      .populate({ path: 'snack', select: 'title price' })
      .populate({ path: 'student', select: 'name referralCode' });

    return res.status(201).json(populated);

  } catch (err) {
    console.error(err);

    // if Mongoose ValidationError comes then console log it

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    return res.status(400).json({ error: err.message });
  }
});


// GET /students/:id Return student with totalSpent and populated orders (snack title, quantity, payableAmount)

app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'orders',
        select: 'snack quantity payableAmount createdAt',
        populate: { path: 'snack', select: 'title price' }
      })
      .lean();

    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json(student);

  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
});


// GET /snacks  Return snacks with title, price, ordersCount

app.get('/snacks', async (req, res) => {
  try {
    const snacks = await Snack.find().select('title price ordersCount').lean();
    return res.json(snacks);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch snacks' });
  }
});


app.get('/', (req, res) => res.send('Canteen ordering prototype running'));

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


