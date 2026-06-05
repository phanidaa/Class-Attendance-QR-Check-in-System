/*
   Class Attendance QR Check-in System - Dashboard View Handler
   Draws metrics cards, dynamic status pie charts, and trends graphs on the teacher console.
*/

const DashboardView = {
  render() {
    const courses = window.db.getCourses();
    const students = window.db.getStudents();
    const sessions = window.db.getSessions();
    const records = window.db.getRecords();

    // 1. Calculate Statistics
    const totalCourses = courses.length;
    const totalStudents = students.length;
    const totalSessions = sessions.length;
    
    // Active Sessions (Status = Open)
    const activeSessions = sessions.filter(s => s.status === 'Open').length;

    // Attendance status distribution
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    records.forEach(r => {
      if (r.status === 'Present') presentCount++;
      else if (r.status === 'Late') lateCount++;
      else if (r.status === 'Absent') absentCount++;
      else if (r.status === 'Excused') excusedCount++;
    });

    const totalValidRecords = presentCount + lateCount + absentCount + excusedCount;
    // Average attendance rate: (Present + Late + Excused) / Total Records
    // (Actually Excused is typically excluded or counted positively. Let's count Present + Late as attended)
    const attendedCount = presentCount + lateCount;
    const averageRate = totalValidRecords > 0 
      ? Math.round((attendedCount / (totalValidRecords - excusedCount)) * 100) 
      : 0;

    // Recent Check-ins
    const sortedRecords = [...records]
      .filter(r => r.checkin_time !== '')
      .sort((a, b) => new Date(b.checkin_time) - new Date(a.checkin_time))
      .slice(0, 5);

    // HTML Structure
    const content = `
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">รายวิชาทั้งหมด</span>
            <span class="stat-value">${totalCourses}</span>
          </div>
          <div class="stat-icon">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">นักศึกษาลงทะเบียน</span>
            <span class="stat-value">${totalStudents}</span>
          </div>
          <div class="stat-icon">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">รอบเช็คชื่อที่เปิดอยู่</span>
            <span class="stat-value" style="color: ${activeSessions > 0 ? 'var(--color-crimson)' : 'inherit'}">${activeSessions}</span>
          </div>
          <div class="stat-icon">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">อัตราการเข้าเรียนเฉลี่ย</span>
            <span class="stat-value">${averageRate}%</span>
          </div>
          <div class="stat-icon">
            <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
          </div>
        </div>
      </div>

      <div class="row-grid">
        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <h3>สถิติอัตราการเข้าเรียนแยกตามคาบ (Attendance Trend)</h3>
            </div>
          </div>
          <div style="position: relative; height: 320px; width: 100%;">
            <canvas id="trendChart"></canvas>
          </div>
        </div>

        <div class="content-card">
          <div class="card-header">
            <div class="card-title">
              <h3>สัดส่วนสถานะการเช็คชื่อทั้งหมด</h3>
            </div>
          </div>
          <div style="position: relative; height: 320px; width: 100%;">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <div class="card-title">
            <h3>การเช็คชื่อล่าสุด (Recent Check-ins)</h3>
          </div>
          <div class="card-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.appRouter('reports')">ดูทั้งหมด</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-สกุล</th>
                <th>รายวิชา</th>
                <th>เวลาเช็คชื่อ</th>
                <th>วิธีการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRecords.length === 0 ? `
                <tr>
                  <td colspan="6" class="text-center text-muted" style="padding: 2rem;">ยังไม่มีรายการเช็คชื่อล่าสุด</td>
                </tr>
              ` : sortedRecords.map(r => {
                const course = courses.find(c => c.id === r.course_id);
                const timeString = new Date(r.checkin_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                let badgeClass = 'badge-present';
                let statusLabel = 'มาเรียน';
                if (r.status === 'Late') { badgeClass = 'badge-late'; statusLabel = 'สาย'; }
                else if (r.status === 'Absent') { badgeClass = 'badge-absent'; statusLabel = 'ขาด'; }
                else if (r.status === 'Excused') { badgeClass = 'badge-excused'; statusLabel = 'ลา'; }

                return `
                  <tr>
                    <td class="font-semibold">${r.student_id}</td>
                    <td>${r.student_name}</td>
                    <td>${course ? `${course.course_code} - ${course.course_name}` : 'ไม่ทราบวิชา'}</td>
                    <td>${timeString} น.</td>
                    <td><span class="text-muted">${r.checkin_method}</span></td>
                    <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;

    // 2. Render Charts after inserting HTML into the DOM
    setTimeout(() => {
      // Status Distribution Chart
      window.UIComponents.renderDoughnutChart(
        'statusChart',
        ['มาเรียนตรงเวลา', 'มาสาย', 'ขาดเรียน', 'ลาป่วย/ลากิจ'],
        [presentCount, lateCount, absentCount, excusedCount],
        'สถานะการเช็คชื่อทั้งหมด'
      );

      // Session Trend Chart (Calculate rates for last 6 sessions)
      const recentSessions = [...sessions]
        .sort((a, b) => new Date(a.session_date + 'T' + a.start_time) - new Date(b.session_date + 'T' + b.start_time))
        .slice(-6);

      const sessionLabels = recentSessions.map(s => {
        const dateObj = new Date(s.session_date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('th-TH', { month: 'short' });
        return `${s.session_code}\n(${day} ${month})`;
      });

      const sessionRates = recentSessions.map(s => {
        const sessionRecs = records.filter(r => r.session_id === s.id);
        const total = sessionRecs.length;
        const attended = sessionRecs.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const excused = sessionRecs.filter(r => r.status === 'Excused').length;
        
        const effectiveTotal = total - excused;
        return effectiveTotal > 0 ? Math.round((attended / effectiveTotal) * 100) : 0;
      });

      window.UIComponents.renderBarChart(
        'trendChart',
        sessionLabels,
        sessionRates,
        'อัตราการเข้าเรียน (%)'
      );
    }, 50);
  }
};

window.DashboardView = DashboardView;
