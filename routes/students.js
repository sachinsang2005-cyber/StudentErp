const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all students
router.get('/', requireAuth, async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('class', { ascending: true })
      .order('roll_no', { ascending: true });

    if (error) throw error;

    res.render('students/index', {
      title: 'Students Management',
      students,
      teacher: req.session.teacher
    });
  } catch (err) {
    req.flash('error', 'Failed to fetch students');
    res.redirect('/dashboard');
  }
});

// Add new student
router.post('/add', requireAuth, async (req, res) => {
  try {
    const { name, class: studentClass, roll_no } = req.body;

    if (!name || !studentClass || !roll_no) {
      req.flash('error', 'All fields are required');
      return res.redirect('/students');
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{ name, class: studentClass, roll_no: parseInt(roll_no) }]);

    if (error) throw error;

    req.flash('success', 'Student added successfully');
    res.redirect('/students');
  } catch (err) {
    req.flash('error', 'Failed to add student');
    res.redirect('/students');
  }
});

// Delete student
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
});

module.exports = router;