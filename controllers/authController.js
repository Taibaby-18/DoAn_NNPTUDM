const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Default role: Gamer
    const gamerRole = await Role.findOne({ name: 'Gamer' });
    if (!gamerRole) {
      return res.status(500).json({ message: 'Gamer role not found. Create roles first.' });
    }

    const user = new User({ username, email, password, role: gamerRole._id });
    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in .env file');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, username, email, role: gamerRole.name }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in .env file');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email, role: user.role.name }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

