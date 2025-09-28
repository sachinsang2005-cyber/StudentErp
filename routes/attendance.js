const express = require('express');
const supabase = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Attendance management page
router.get('/', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = req.query.date || today;

    // Get all students with their attendance for the selected date
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        *,
        attendance!left(status, date)
      `)
      .eq('attendance.date', selectedDate)
      .order('class', { ascending: true })
      .order('roll_no', { ascending: true });

    if (studentsError) throw studentsError;

    res.render('attendance/index', {
      title: 'Attendance Management',
      students: students || [],
      selectedDate,
      teacher: req.session.teacher
    });
  } catch (err) {
    req.flash('error', 'Failed to fetch attendance data');
    res.redirect('/dashboard');
  }
});

// Mark attendance
router.post('/mark', requireAuth, async (req, res) => {
  try {
    const { attendanceData, date } = req.body;
    
    if (!attendanceData || !date) {
      return res.status(400).json({ success: false, error: 'Missing required data' });
    }

    const attendanceRecords = JSON.parse(attendanceData);
    
    // Prepare attendance records for upsert
    const records = attendanceRecords.map(record => ({
      student_id: record.student_id,
      date: date,
      status: record.status,
      marked_by: req.session.teacher.id
    }));

    // Use upsert to handle existing records
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { 
        onConflict: 'student_id,date',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    res.json({ success: true, message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to mark attendance' });
  }
});

// Get attendance history for a student
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        *,
        teachers(name)
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (attendanceError) throw attendanceError;

    res.render('attendance/student', {
      title: `Attendance History - ${student.name}`,
      student,
      attendanceRecords: attendanceRecords || [],
      teacher: req.session.teacher
    });
  } catch (err) {
    req.flash('error', 'Failed to fetch attendance history');
    res.redirect('/attendance');
  }
});

module.exports = router;