const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Fees management page
router.get('/', requireAuth, async (req, res) => {
  try {
    // Get all students with their latest fee record
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        fees(*)
      `)
      .order('class', { ascending: true })
      .order('roll_no', { ascending: true });

    if (error) throw error;

    // Process students to get latest fee record
    const studentsWithFees = students.map(student => ({
      ...student,
      latestFee: student.fees && student.fees.length > 0 
        ? student.fees.reduce((latest, current) => 
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
          )
        : null
    }));

    res.render('fees/index', {
      title: 'Fees Management',
      students: studentsWithFees,
      teacher: req.session.teacher
    });
  } catch (err) {
    req.flash('error', 'Failed to fetch fees data');
    res.redirect('/dashboard');
  }
});

// Record/Update fee payment
router.post('/record', requireAuth, async (req, res) => {
  try {
    const { student_id, amount, status, payment_date } = req.body;

    if (!student_id || !amount || !status) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const feeRecord = {
      student_id,
      amount: parseFloat(amount),
      status,
      payment_date: status === 'Paid' ? payment_date || new Date().toISOString().split('T')[0] : null,
      recorded_by: req.session.teacher.id
    };

    const { data, error } = await supabase
      .from('fees')
      .insert([feeRecord]);

    if (error) throw error;

    res.json({ success: true, message: 'Fee record added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to record fee' });
  }
});

// Update fee status
router.put('/update/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_date } = req.body;

    const updateData = {
      status,
      payment_date: status === 'Paid' ? payment_date || new Date().toISOString().split('T')[0] : null
    };

    const { error } = await supabase
      .from('fees')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Fee status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update fee status' });
  }
});

// Get fee history for a student
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    const { data: feeRecords, error: feesError } = await supabase
      .from('fees')
      .select(`
        *,
        teachers(name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (feesError) throw feesError;

    res.render('fees/student', {
      title: `Fee History - ${student.name}`,
      student,
      feeRecords: feeRecords || [],
      teacher: req.session.teacher
    });
  } catch (err) {
    req.flash('error', 'Failed to fetch fee history');
    res.redirect('/fees');
  }
});

module.exports = router;