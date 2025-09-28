const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    // Get dashboard statistics
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id');

    const { data: todayAttendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', new Date().toISOString().split('T')[0]);

    const { data: pendingFees, error: feesError } = await supabase
      .from('fees')
      .select('id')
      .eq('status', 'Pending');

    const { data: paidFees, error: paidFeesError } = await supabase
      .from('fees')
      .select('id')
      .eq('status', 'Paid');

    if (studentsError || attendanceError || feesError || paidFeesError) {
      throw new Error('Failed to fetch dashboard data');
    }

    const totalStudents = students ? students.length : 0;
    const presentToday = todayAttendance ? todayAttendance.filter(a => a.status === 'Present').length : 0;
    const absentToday = todayAttendance ? todayAttendance.filter(a => a.status === 'Absent').length : 0;
    const pendingFeesCount = pendingFees ? pendingFees.length : 0;
    const paidFeesCount = paidFees ? paidFees.length : 0;

    res.render('dashboard/index', {
      title: 'Dashboard',
      teacher: req.session.teacher,
      stats: {
        totalStudents,
        presentToday,
        absentToday,
        pendingFeesCount,
        paidFeesCount
      }
    });
  } catch (err) {
    req.flash('error', 'Failed to load dashboard');
    res.render('dashboard/index', {
      title: 'Dashboard',
      teacher: req.session.teacher,
      stats: {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        pendingFeesCount: 0,
        paidFeesCount: 0
      }
    });
  }
});

module.exports = router;