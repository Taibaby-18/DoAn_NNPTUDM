const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/User');
const Role = require('../models/Role'); // Optional, but allowed
const router = express.Router();

router.post('/register', async function (req, res, next) {
  try {
    const { username, email, password } = req.body;
    const result = await authController.RegisterUser(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authController.LoginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;
