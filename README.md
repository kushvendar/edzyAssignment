# 🍴 School Canteen Ordering System (Express + Mongoose)

A simple prototype backend built with **Express** and **Mongoose** for a school canteen.  
Students can place snack orders, the canteen can track popular snacks, and students can view their total spending.  

This project demonstrates the use of **Mongoose hooks**:
- `pre-save` (Student model) → auto-generate referral code  
- `pre-validate` (Order model) → validate quantity & calculate payable amount  
- `post-save` (Order model) → update related Student and Snack documents  

---

## 🚀 Features
- Create students with **auto-generated referral codes**
- Seed snacks (e.g., *Samosa*, *Idli*, *Veg Puff*, *Macroni*, *Chilli Potato*)  
- Place orders with **automatic payable amount calculation**
- Update student’s `totalSpent` and `orders` automatically
- Update snack’s `ordersCount` automatically
- Fetch student details with populated order history
- Fetch snack list with popularity (ordersCount)

---

## 📂 Project Structure

.
├── models/
│ ├── student.js
│ ├── snack.js
│ └── order.js
├── server.js
├── package.json
├── .env
└── README.md

## ⚙️ Installation & Setup

1. **Clone the repo**
   `
   git clone https://github.com/kushvendar/edzyAssignment.git
   cd edzyAssignment

Install dependencies

npm install
Configure environment
Create a .env file in the root:

env
Copy code
MONGO_URI="YOUR-URI-STRING"
PORT=3000

node server.js
Server runs on: http://localhost:3000

