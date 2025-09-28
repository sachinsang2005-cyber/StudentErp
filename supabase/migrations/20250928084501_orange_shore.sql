/*
  # School ERP System Database Schema

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password` (text)
      - `created_at` (timestamp)
    - `students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `class` (text)
      - `roll_no` (integer, unique)
      - `created_at` (timestamp)
    - `attendance`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `date` (date)
      - `status` (text, check constraint)
      - `marked_by` (uuid, foreign key to teachers)
      - `created_at` (timestamp)
    - `fees`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `amount` (numeric)
      - `status` (text, check constraint)
      - `payment_date` (date)
      - `recorded_by` (uuid, foreign key to teachers)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated teachers
    - Proper foreign key constraints

  3. Sample Data
    - Insert sample teachers, students, and records for testing
*/

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  class text NOT NULL,
  roll_no integer UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text CHECK (status IN ('Present', 'Absent')) NOT NULL,
  marked_by uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status text CHECK (status IN ('Paid', 'Pending')) DEFAULT 'Pending',
  payment_date date,
  recorded_by uuid REFERENCES teachers(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers
CREATE POLICY "Teachers can manage all data"
  ON teachers
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage fees"
  ON fees
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample teachers
INSERT INTO teachers (name, email, password) VALUES
('John Smith', 'john@school.com', '$2a$10$rQZ5qZ5qZ5qZ5qZ5qZ5qZu'),
('Sarah Johnson', 'sarah@school.com', '$2a$10$rQZ5qZ5qZ5qZ5qZ5qZ5qZu');

-- Insert sample students
INSERT INTO students (name, class, roll_no) VALUES
('Alice Wilson', '10-A', 101),
('Bob Brown', '10-A', 102),
('Carol Davis', '10-A', 103),
('David Miller', '10-B', 201),
('Eva Garcia', '10-B', 202),
('Frank Lee', '10-B', 203),
('Grace Chen', '11-A', 301),
('Henry Taylor', '11-A', 302),
('Ivy Anderson', '11-A', 303),
('Jack Wilson', '11-B', 401);

-- Insert sample fee records
INSERT INTO fees (student_id, amount, status, payment_date, recorded_by) 
SELECT 
  s.id,
  CASE 
    WHEN s.roll_no % 3 = 0 THEN 5000.00
    WHEN s.roll_no % 3 = 1 THEN 4500.00
    ELSE 5500.00
  END as amount,
  CASE WHEN s.roll_no % 2 = 0 THEN 'Paid' ELSE 'Pending' END as status,
  CASE WHEN s.roll_no % 2 = 0 THEN CURRENT_DATE - INTERVAL '10 days' ELSE NULL END as payment_date,
  (SELECT id FROM teachers LIMIT 1) as recorded_by
FROM students s;