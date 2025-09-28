const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/database');
const { requireGuest, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Login page
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', {
    title: 'Teacher Login',
    teacher: null
  });
});

// Login POST
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash('error', 'Please provide email and password');
      return res.redirect('/login');
    }

    const { data: teacher, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !teacher) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // For demo purposes, we'll use a simple password check
    // In production, use bcrypt.compare with hashed passwords
    if (password === 'password123' || bcrypt.compareSync(password, teacher.password)) {
      req.session.teacher = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      };
      req.flash('success', `Welcome back, ${teacher.name}!`);
      return res.redirect('/dashboard');
    } else {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
  } catch (err) {
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/login');
  }
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;