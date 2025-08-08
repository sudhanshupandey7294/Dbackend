// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const JWT_SECRET = 'your_jwt_secret'; // In production use .env

// // exports.signup = async (req, res) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     const existingUser = await User.findOne({ email });
// //     if (existingUser) return res.status(400).json({ message: 'Email already exists' });

// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     const newUser = new User({
// //       name,
// //       email,
// //       password: hashedPassword
// //     });

// //     await newUser.save();

// //     res.status(201).json({ message: 'Signup successful' });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Server error during signup' });
// //   }
// // };
// exports.signup = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // ✅ Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Account already exists with this email' });
//     }

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ Create new user
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();

//     // ✅ Respond with success (NO token here)
//     res.status(201).json({ message: 'Signup successful. Please login.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error during signup' });
//   }
// }
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid email or password' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error during login' });
//   }
// };

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Signup successful' }); // Don't send token here
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

