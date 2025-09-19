const express = require('express')
const mongoose = require('mongoose')

const Student = require('./models/student');
const Snack = require('./models/snack');
const Order = require('./models/order');


const app = express()
app.use(express.json())

