const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

async function generateDepositCode() {
  let code;
  let exists;

  do {
    code = "NAP_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    exists = await User.findOne({ depositCode: code });
  } while (exists);

  return code;
}

module.exports = {

  RegisterUser: async function (username, email, password) {

    const gamerRole = await Role.findOne({ name: 'Gamer' });
    if (!gamerRole) {
      throw new Error('Gamer role not found. Create roles first.');
    }

    const depositCode = await generateDepositCode();

    const user = new User({
      username,
      email,
      password,
      role: gamerRole._id,
      depositCode
    });

    await user.save();

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in .env file');
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username,
        email,
        role: gamerRole.name,
        depositCode: user.depositCode 
      }
    };
  },

  LoginUser: async function (email, password) {
    const user = await User.findOne({ email }).populate('role');

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Missing JWT_SECRET in .env file');
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email,
        role: user.role.name,
        depositCode: user.depositCode 
      }
    };
  }

};