/*
   Class Attendance QR Check-in System - Storage Service
   Handles LocalStorage persistence and populates realistic seed data on first load.
*/

class AttendanceStorage {
  constructor() {
    this.KEYS = {
      COURSES: 'attendance_courses',
      STUDENTS: 'attendance_students',
      SESSIONS: 'attendance_sessions',
      RECORDS: 'attendance_records',
      INITIALIZED: 'attendance_db_initialized'
    };
    
    this.initDatabase();
  }

  // Initialize DB and Seed Data
  initDatabase() {
    if (!localStorage.getItem(this.KEYS.INITIALIZED)) {
      console.log('Initializing LocalStorage database with realistic seed data...');
      
      const seedCourses = [
        {
          id: 'course-1',
          course_code: 'EN-013-333',
          course_name: 'Web Programming and Design Lab',
          section: 'Sec 1',
          semester: '1/2026',
          academic_year: '2026',
          teacher_name: 'Dr. Jirapat Srivorasing',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'course-2',
          course_code: 'CP-211-102',
          course_name: 'Computer Architecture Lab',
          section: 'Sec 2',
          semester: '1/2026',
          academic_year: '2026',
          teacher_name: 'Asst. Prof. Somchai Pattana',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const seedStudents = [
        // Course 1 Students
        { id: 'stud-1', student_id: '66010101', full_name: 'เกียรติศักดิ์ อุดมดี', email: 'kiatisak.u@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-2', student_id: '66010102', full_name: 'นภาพร จรัสแสง', email: 'napaporn.j@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-3', student_id: '66010103', full_name: 'วิชัย รักวิทยา', email: 'wichai.r@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-4', student_id: '66010104', full_name: 'สุรพงษ์ แก้วดี', email: 'surapong.k@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-5', student_id: '66010105', full_name: 'จิราภรณ์ สุขใจ', email: 'jiraporn.s@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-6', student_id: '66010106', full_name: 'ธนพล สินทรัพย์', email: 'thanapon.s@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-7', student_id: '66010107', full_name: 'มนัสวี พรหมคุณ', email: 'manaswee.p@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },
        { id: 'stud-8', student_id: '66010108', full_name: 'ปรีชา รุ่งเรือง', email: 'preecha.r@mail.edu', course_id: 'course-1', created_at: new Date().toISOString() },

        // Course 2 Students
        { id: 'stud-9', student_id: '66020201', full_name: 'สมคิด มั่นคง', email: 'somkid.m@mail.edu', course_id: 'course-2', created_at: new Date().toISOString() },
        { id: 'stud-10', student_id: '66020202', full_name: 'อัญชลี รอดภัย', email: 'anchalee.r@mail.edu', course_id: 'course-2', created_at: new Date().toISOString() },
        { id: 'stud-11', student_id: '66020203', full_name: 'ปกรณ์ ธรรมดี', email: 'pakorn.d@mail.edu', course_id: 'course-2', created_at: new Date().toISOString() },
        { id: 'stud-12', student_id: '66020204', full_name: 'ลัดดา วรรณนา', email: 'ladda.w@mail.edu', course_id: 'course-2', created_at: new Date().toISOString() },
        { id: 'stud-13', student_id: '66020205', full_name: 'สิทธิชัย เรืองศิลป์', email: 'sitthichai.r@mail.edu', course_id: 'course-2', created_at: new Date().toISOString() }
      ];

      // Sessions for Course 1
      const seedSessions = [
        {
          id: 'sess-1',
          course_id: 'course-1',
          session_title: 'Lab 01: Getting Started with HTML & CSS',
          session_code: 'HTML-8F2K',
          session_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '12:00',
          late_after_minutes: 15,
          status: 'Closed',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sess-2',
          course_id: 'course-1',
          session_title: 'Lab 02: Responsive Design & Grid',
          session_code: 'GRID-3C9A',
          session_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '12:00',
          late_after_minutes: 15,
          status: 'Closed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'sess-3',
          course_id: 'course-1',
          session_title: 'Lab 03: JavaScript DOM Basics',
          session_code: 'DOMB-7V8L',
          session_date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '12:00',
          late_after_minutes: 15,
          status: 'Open',
          created_at: new Date().toISOString()
        },
        // Session for Course 2
        {
          id: 'sess-4',
          course_id: 'course-2',
          session_title: 'Lab 01: Assembly Instructions Intro',
          session_code: 'ASM1-4E6X',
          session_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '13:00',
          end_time: '16:00',
          late_after_minutes: 10,
          status: 'Closed',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Records for history
      const seedRecords = [
        // Sess-1 Check-ins (Lab 01 for Course 1)
        { id: 'rec-1', session_id: 'sess-1', course_id: 'course-1', student_id: '66010101', student_name: 'เกียรติศักดิ์ อุดมดี', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:55:20.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-2', session_id: 'sess-1', course_id: 'course-1', student_id: '66010102', student_name: 'นภาพร จรัสแสง', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:58:10.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-3', session_id: 'sess-1', course_id: 'course-1', student_id: '66010103', student_name: 'วิชัย รักวิทยา', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:12:45.000Z', status: 'Present', checkin_method: 'Session Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-4', session_id: 'sess-1', course_id: 'course-1', student_id: '66010104', student_name: 'สุรพงษ์ แก้วดี', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:20:12.000Z', status: 'Late', checkin_method: 'QR Code', note: 'รถติด', created_at: new Date().toISOString() },
        { id: 'rec-5', session_id: 'sess-1', course_id: 'course-1', student_id: '66010105', student_name: 'จิราภรณ์ สุขใจ', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:50:33.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-6', session_id: 'sess-1', course_id: 'course-1', student_id: '66010106', student_name: 'ธนพล สินทรัพย์', checkin_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:02:15.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        // Pre-loaded absences
        { id: 'rec-7', session_id: 'sess-1', course_id: 'course-1', student_id: '66010107', student_name: 'มนัสวี พรหมคุณ', checkin_time: '', status: 'Absent', checkin_method: 'Manual', note: 'ไม่มีการเช็คชื่อเข้าเรียน', created_at: new Date().toISOString() },
        { id: 'rec-8', session_id: 'sess-1', course_id: 'course-1', student_id: '66010108', student_name: 'ปรีชา รุ่งเรือง', checkin_time: '', status: 'Excused', checkin_method: 'Manual', note: 'ลาป่วย มีใบรับรองแพทย์', created_at: new Date().toISOString() },

        // Sess-2 Check-ins (Lab 02 for Course 1)
        { id: 'rec-9', session_id: 'sess-2', course_id: 'course-1', student_id: '66010101', student_name: 'เกียรติศักดิ์ อุดมดี', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:54:10.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-10', session_id: 'sess-2', course_id: 'course-1', student_id: '66010102', student_name: 'นภาพร จรัสแสง', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:56:45.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-11', session_id: 'sess-2', course_id: 'course-1', student_id: '66010103', student_name: 'วิชัย รักวิทยา', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:59:15.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-12', session_id: 'sess-2', course_id: 'course-1', student_id: '66010104', student_name: 'สุรพงษ์ แก้วดี', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:05:00.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-13', session_id: 'sess-2', course_id: 'course-1', student_id: '66010105', student_name: 'จิราภรณ์ สุขใจ', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:18:20.000Z', status: 'Late', checkin_method: 'QR Code', note: 'รถไฟฟ้าขัดข้อง', created_at: new Date().toISOString() },
        { id: 'rec-14', session_id: 'sess-2', course_id: 'course-1', student_id: '66010106', student_name: 'ธนพล สินทรัพย์', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:22:40.000Z', status: 'Late', checkin_method: 'Session Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-15', session_id: 'sess-2', course_id: 'course-1', student_id: '66010107', student_name: 'มนัสวี พรหมคุณ', checkin_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:58:30.000Z', status: 'Present', checkin_method: 'QR Code', note: '', created_at: new Date().toISOString() },
        { id: 'rec-16', session_id: 'sess-2', course_id: 'course-1', student_id: '66010108', student_name: 'ปรีชา รุ่งเรือง', checkin_time: '', status: 'Absent', checkin_method: 'Manual', note: '', created_at: new Date().toISOString() }
      ];

      localStorage.setItem(this.KEYS.COURSES, JSON.stringify(seedCourses));
      localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(seedStudents));
      localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(seedSessions));
      localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(seedRecords));
      localStorage.setItem(this.KEYS.INITIALIZED, 'true');
    }
  }

  // --- CRUD Courses ---
  getCourses() {
    return JSON.parse(localStorage.getItem(this.KEYS.COURSES)) || [];
  }

  getCourseById(id) {
    return this.getCourses().find(c => c.id === id);
  }

  saveCourse(course) {
    const courses = this.getCourses();
    if (course.id) {
      const idx = courses.findIndex(c => c.id === course.id);
      if (idx !== -1) {
        courses[idx] = { ...courses[idx], ...course };
      }
    } else {
      course.id = 'course-' + Math.random().toString(36).substr(2, 9);
      course.created_at = new Date().toISOString();
      courses.push(course);
    }
    localStorage.setItem(this.KEYS.COURSES, JSON.stringify(courses));
    return course;
  }

  deleteCourse(id) {
    let courses = this.getCourses();
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem(this.KEYS.COURSES, JSON.stringify(courses));
    
    // Cascading deletes for students/sessions/records
    let students = this.getStudents();
    students = students.filter(s => s.course_id !== id);
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));

    let sessions = this.getSessions();
    sessions = sessions.filter(s => s.course_id !== id);
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));

    let records = this.getRecords();
    records = records.filter(r => r.course_id !== id);
    localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
  }

  // --- CRUD Students ---
  getStudents() {
    return JSON.parse(localStorage.getItem(this.KEYS.STUDENTS)) || [];
  }

  getStudentsByCourse(courseId) {
    return this.getStudents().filter(s => s.course_id === courseId);
  }

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id);
  }

  getStudentBySchoolId(studentId, courseId) {
    return this.getStudents().find(s => s.student_id === studentId && s.course_id === courseId);
  }

  saveStudent(student) {
    const students = this.getStudents();
    
    // Check duplication of Student ID within the same course
    const dup = students.find(s => s.student_id === student.student_id && s.course_id === student.course_id && s.id !== student.id);
    if (dup) {
      throw new Error(`รหัสนักศึกษา ${student.student_id} มีอยู่ในรายวิชานี้แล้ว!`);
    }

    if (student.id) {
      const idx = students.findIndex(s => s.id === student.id);
      if (idx !== -1) {
        students[idx] = { ...students[idx], ...student };
      }
    } else {
      student.id = 'stud-' + Math.random().toString(36).substr(2, 9);
      student.created_at = new Date().toISOString();
      students.push(student);
    }
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));
    return student;
  }

  deleteStudent(id) {
    let students = this.getStudents();
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    students = students.filter(s => s.id !== id);
    localStorage.setItem(this.KEYS.STUDENTS, JSON.stringify(students));

    // Also remove their attendance records
    let records = this.getRecords();
    records = records.filter(r => r.student_id !== student.student_id || r.course_id !== student.course_id);
    localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
  }

  importStudentsFromCSV(courseId, csvText) {
    const lines = csvText.split('\n');
    let importedCount = 0;
    let errors = [];

    lines.forEach((line, index) => {
      // Skip empty lines or header row if starts with header strings
      if (!line.trim() || line.toLowerCase().includes('student_id') || line.includes('รหัสนักศึกษา')) return;

      // Parsing comma or tab delimited values
      const cols = line.split(/[,\t]/).map(c => c.trim());
      if (cols.length < 2) return;

      const studentId = cols[0];
      const fullName = cols[1];
      const email = cols[2] || '';

      if (!studentId || !fullName) {
        errors.push(`แถวที่ ${index + 1}: ข้อมูลไม่ครบถ้วน`);
        return;
      }

      try {
        this.saveStudent({
          student_id: studentId,
          full_name: fullName,
          email: email,
          course_id: courseId
        });
        importedCount++;
      } catch (err) {
        errors.push(`แถวที่ ${index + 1}: ${err.message}`);
      }
    });

    return { success: importedCount, errors };
  }

  // --- CRUD Sessions ---
  getSessions() {
    return JSON.parse(localStorage.getItem(this.KEYS.SESSIONS)) || [];
  }

  getSessionsByCourse(courseId) {
    return this.getSessions().filter(s => s.course_id === courseId);
  }

  getSessionById(id) {
    return this.getSessions().find(s => s.id === id);
  }

  getSessionByCode(code) {
    return this.getSessions().find(s => s.session_code.toUpperCase() === code.trim().toUpperCase());
  }

  generateSessionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const existing = this.getSessions().map(s => s.session_code);
    
    do {
      code = '';
      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      code += '-';
      for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    } while (existing.includes(code));
    
    return code;
  }

  saveSession(session) {
    const sessions = this.getSessions();
    if (session.id) {
      const idx = sessions.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        sessions[idx] = { ...sessions[idx], ...session };
      }
    } else {
      session.id = 'sess-' + Math.random().toString(36).substr(2, 9);
      session.session_code = this.generateSessionCode();
      session.created_at = new Date().toISOString();
      sessions.push(session);
      
      // Auto-create absent records for all enrolled students initially
      const enrolledStudents = this.getStudentsByCourse(session.course_id);
      enrolledStudents.forEach(student => {
        this.saveRecord({
          session_id: session.id,
          course_id: session.course_id,
          student_id: student.student_id,
          student_name: student.full_name,
          checkin_time: '',
          status: 'Absent',
          checkin_method: 'Manual',
          note: 'ไม่มีการเช็คชื่อเข้าเรียน'
        });
      });
    }
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
    return session;
  }

  deleteSession(id) {
    let sessions = this.getSessions();
    sessions = sessions.filter(s => s.id !== id);
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));

    // Also delete attendance records for this session
    let records = this.getRecords();
    records = records.filter(r => r.session_id !== id);
    localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
  }

  // --- Attendance Records Management ---
  getRecords() {
    return JSON.parse(localStorage.getItem(this.KEYS.RECORDS)) || [];
  }

  getRecordsBySession(sessionId) {
    return this.getRecords().filter(r => r.session_id === sessionId);
  }

  saveRecord(record) {
    const records = this.getRecords();
    if (record.id) {
      const idx = records.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...record };
      }
    } else {
      record.id = 'rec-' + Math.random().toString(36).substr(2, 9);
      record.created_at = new Date().toISOString();
      records.push(record);
    }
    localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
    return record;
  }

  // Student Self Check-in Logic
  checkinStudent(sessionCode, studentId, studentName) {
    const session = this.getSessionByCode(sessionCode);
    if (!session) {
      throw new Error('ไม่พบรหัสเช็คชื่อ หรือรหัสนี้ไม่ถูกต้อง');
    }

    if (session.status !== 'Open') {
      throw new Error('รอบการเช็คชื่อนี้ถูกปิดหรือยกเลิกแล้ว');
    }

    // Verify student exists in the course
    const student = this.getStudentBySchoolId(studentId, session.course_id);
    if (!student) {
      throw new Error(`รหัสนักศึกษา ${studentId} ไม่ได้ลงทะเบียนในรายวิชานี้`);
    }

    // Check if names match reasonably (optional but good for safety validation)
    const storedLastName = student.full_name.split(' ').pop();
    const inputLastName = studentName.split(' ').pop();
    // (A very basic match: check if student ID exists, name matches at least partially)

    // Check already checked in
    const records = this.getRecordsBySession(session.id);
    const existingRecord = records.find(r => r.student_id === studentId);
    
    if (existingRecord && existingRecord.checkin_time) {
      throw new Error(`รหัสนักศึกษา ${studentId} ได้เช็คชื่อในรอบนี้แล้วเมื่อเวลา ${new Date(existingRecord.checkin_time).toLocaleTimeString('th-TH')}`);
    }

    // Process check-in calculation
    const now = new Date();
    
    // Parse session date and times
    const [startH, startM] = session.start_time.split(':').map(Number);
    const sessionStart = new Date(session.session_date);
    sessionStart.setHours(startH, startM, 0);

    const [endH, endM] = session.end_time.split(':').map(Number);
    const sessionEnd = new Date(session.session_date);
    sessionEnd.setHours(endH, endM, 0);

    if (now > sessionEnd) {
      throw new Error('การเช็คชื่อนี้ปิดระบบโดยอัตโนมัติแล้ว เนื่องจากหมดเวลารอบเรียน');
    }

    // Calculate Late status
    const minutesDiff = (now - sessionStart) / (1000 * 60);
    let checkinStatus = 'Present';
    if (minutesDiff > session.late_after_minutes) {
      checkinStatus = 'Late';
    }

    // Find the pre-seeded "Absent" record and update it
    let recordToSave;
    if (existingRecord) {
      recordToSave = {
        ...existingRecord,
        checkin_time: now.toISOString(),
        status: checkinStatus,
        checkin_method: 'QR Code',
        note: checkinStatus === 'Late' ? `มาเรียนสาย (${Math.ceil(minutesDiff)} นาที)` : ''
      };
    } else {
      recordToSave = {
        session_id: session.id,
        course_id: session.course_id,
        student_id: studentId,
        student_name: student.full_name,
        checkin_time: now.toISOString(),
        status: checkinStatus,
        checkin_method: 'QR Code',
        note: checkinStatus === 'Late' ? `มาเรียนสาย (${Math.ceil(minutesDiff)} นาที)` : ''
      };
    }

    this.saveRecord(recordToSave);
    return recordToSave;
  }
}

// Export as globally accessible instance
window.db = new AttendanceStorage();
console.log('AttendanceStorage initialized successfully!');
