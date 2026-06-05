/*
   Class Attendance QR Check-in System - Reports View Handler
   Controls attendance listings, filters, manual overrides, notes, and UTF-8 CSV downloads.
*/

const ReportsView = {
  selectedCourseId: null,
  selectedSessionId: null,
  selectedStatus: 'All',
  searchQuery: '',

  render() {
    const courses = window.db.getCourses();
    
    // Default selects
    if (courses.length > 0 && !this.selectedCourseId) {
      this.selectedCourseId = courses[0].id;
    }

    const sessions = this.selectedCourseId ? window.db.getSessionsByCourse(this.selectedCourseId) : [];
    
    if (sessions.length > 0 && !this.selectedSessionId) {
      // default to the latest session
      const sorted = [...sessions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      this.selectedSessionId = sorted[0].id;
    }

    // Filtered records list
    let filteredRecords = [];
    let currentSession = null;
    let currentCourse = null;

    if (this.selectedSessionId) {
      currentSession = window.db.getSessionById(this.selectedSessionId);
      currentCourse = window.db.getCourseById(this.selectedCourseId);
      
      const allRecords = window.db.getRecordsBySession(this.selectedSessionId);
      
      filteredRecords = allRecords.filter(r => {
        // Status filter
        if (this.selectedStatus !== 'All' && r.status !== this.selectedStatus) return false;
        
        // Search query filter (matches ID or Name)
        if (this.searchQuery.trim()) {
          const q = this.searchQuery.toLowerCase().trim();
          const matchId = r.student_id.toLowerCase().includes(q);
          const matchName = r.student_name.toLowerCase().includes(q);
          if (!matchId && !matchName) return false;
        }
        
        return true;
      });
    }

    // Attendance stats for selected session
    let presentCount = 0, lateCount = 0, absentCount = 0, excusedCount = 0;
    filteredRecords.forEach(r => {
      if (r.status === 'Present') presentCount++;
      else if (r.status === 'Late') lateCount++;
      else if (r.status === 'Absent') absentCount++;
      else if (r.status === 'Excused') excusedCount++;
    });

    const content = `
      <div class="content-card mb-3">
        <div class="card-header">
          <div class="card-title">
            <h3>รายงานการเข้าเรียน (Attendance Reports)</h3>
          </div>
          <div class="card-actions">
            ${filteredRecords.length > 0 ? `
              <button class="btn btn-secondary btn-sm" onclick="ReportsView.exportToCSV()" title="ดาวน์โหลดเป็นไฟล์ CSV สำหรับ Excel">
                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                ส่งออกรายงาน (CSV)
              </button>
            ` : ''}
          </div>
        </div>

        <div class="filter-row mt-2">
          <!-- Course Select -->
          <div class="filter-item">
            <label class="form-label">วิชาเรียน</label>
            <select class="form-control" id="rep-course-select" onchange="ReportsView.handleCourseChange(this.value)">
              ${courses.map(c => `<option value="${c.id}" ${c.id === this.selectedCourseId ? 'selected' : ''}>${c.course_code} - ${c.course_name}</option>`).join('')}
              ${courses.length === 0 ? '<option value="">-- ไม่มีวิชาเรียน --</option>' : ''}
            </select>
          </div>

          <!-- Session Select -->
          <div class="filter-item">
            <label class="form-label">คาบเรียน / รอบเรียน</label>
            <select class="form-control" id="rep-session-select" onchange="ReportsView.handleSessionChange(this.value)">
              ${sessions.map(s => `<option value="${s.id}" ${s.id === this.selectedSessionId ? 'selected' : ''}>${s.session_code} - ${s.session_title}</option>`).join('')}
              ${sessions.length === 0 ? '<option value="">-- ไม่มีรอบเรียน --</option>' : ''}
            </select>
          </div>

          <!-- Status Select -->
          <div class="filter-item" style="max-width: 150px;">
            <label class="form-label">กรองตามสถานะ</label>
            <select class="form-control" id="rep-status-select" onchange="ReportsView.handleStatusChange(this.value)">
              <option value="All" ${this.selectedStatus === 'All' ? 'selected' : ''}>ทั้งหมด</option>
              <option value="Present" ${this.selectedStatus === 'Present' ? 'selected' : ''}>มาเรียน (ตรงเวลา)</option>
              <option value="Late" ${this.selectedStatus === 'Late' ? 'selected' : ''}>มาสาย</option>
              <option value="Absent" ${this.selectedStatus === 'Absent' ? 'selected' : ''}>ขาดเรียน</option>
              <option value="Excused" ${this.selectedStatus === 'Excused' ? 'selected' : ''}>ลาเรียน</option>
            </select>
          </div>

          <!-- Text Search -->
          <div class="filter-item" style="flex: 1.5; min-width: 200px;">
            <label class="form-label">ค้นหานักศึกษา</label>
            <input class="form-control" type="text" id="rep-search-input" placeholder="พิมพ์รหัสหรือชื่อเพื่อค้นหา..." value="${this.searchQuery}" oninput="ReportsView.handleSearch(this.value)" />
          </div>
        </div>
      </div>

      <!-- Quick Session Stats Overview -->
      ${currentSession ? `
        <div class="dashboard-grid mb-3" style="grid-template-columns: repeat(4, 1fr); gap: 1rem;">
          <div style="background-color: var(--color-card-bg); padding: 0.8rem; border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--color-present); box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">มาตรงเวลา (Present)</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-present);">${presentCount} คน</div>
          </div>
          <div style="background-color: var(--color-card-bg); padding: 0.8rem; border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--color-late); box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">มาเรียนสาย (Late)</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-late);">${lateCount} คน</div>
          </div>
          <div style="background-color: var(--color-card-bg); padding: 0.8rem; border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--color-absent); box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">ขาดเรียน (Absent)</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-absent);">${absentCount} คน</div>
          </div>
          <div style="background-color: var(--color-card-bg); padding: 0.8rem; border-radius: var(--radius-md); text-align: center; border-left: 4px solid var(--color-excused); box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">ลาป่วย/ลากิจ (Excused)</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-excused);">${excusedCount} คน</div>
          </div>
        </div>
      ` : ''}

      <div class="content-card">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 80px;">ลำดับ</th>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>เวลาสแกนจริง</th>
                <th>วิธีการเช็คชื่อ</th>
                <th style="width: 140px;">สถานะการเข้าเรียน</th>
                <th>หมายเหตุ / รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody>
              ${!this.selectedSessionId ? `
                <tr>
                  <td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">ยังไม่มีข้อมูลเช็คชื่อสำหรับค้นหาในขณะนี้</td>
                </tr>
              ` : filteredRecords.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">ไม่พบข้อมูลสอดคล้องกับตัวกรองหรือคำค้นหา</td>
                </tr>
              ` : filteredRecords.map((r, index) => {
                let badgeClass = 'badge-present';
                let statusLabel = 'มาเรียน';
                if (r.status === 'Late') { badgeClass = 'badge-late'; statusLabel = 'สาย'; }
                else if (r.status === 'Absent') { badgeClass = 'badge-absent'; statusLabel = 'ขาดเรียน'; }
                else if (r.status === 'Excused') { badgeClass = 'badge-excused'; statusLabel = 'ลาเรียน'; }

                const timeStr = r.checkin_time 
                  ? new Date(r.checkin_time).toLocaleTimeString('th-TH') + ' น.' 
                  : '-';

                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="font-semibold">${r.student_id}</td>
                    <td>${r.student_name}</td>
                    <td>${timeStr}</td>
                    <td><span class="text-muted" style="font-size: 0.85rem;">${r.checkin_time ? r.checkin_method : '-'}</span></td>
                    <td>
                      <!-- Editable Status Selector triggers directly on change -->
                      <select class="form-control" style="font-size: 0.8rem; padding: 0.2rem 0.4rem; height: auto;" onchange="ReportsView.handleManualStatusOverride('${r.id}', this.value)">
                        <option value="Present" ${r.status === 'Present' ? 'selected' : ''}>มาเรียน</option>
                        <option value="Late" ${r.status === 'Late' ? 'selected' : ''}>สาย</option>
                        <option value="Absent" ${r.status === 'Absent' ? 'selected' : ''}>ขาดเรียน</option>
                        <option value="Excused" ${r.status === 'Excused' ? 'selected' : ''}>ลาเรียน</option>
                      </select>
                    </td>
                    <td>
                      <input class="form-control" type="text" style="font-size: 0.8rem; padding: 0.2rem 0.4rem;" value="${r.note || ''}" placeholder="คลิกเพื่อพิมพ์ข้อความบันทึก..." onblur="ReportsView.handleSaveNote('${r.id}', this.value)" />
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;
  },

  handleCourseChange(courseId) {
    this.selectedCourseId = courseId;
    this.selectedSessionId = null; // force recalculate latest session
    this.render();
  },

  handleSessionChange(sessionId) {
    this.selectedSessionId = sessionId;
    this.render();
  },

  handleStatusChange(status) {
    this.selectedStatus = status;
    this.render();
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  },

  handleManualStatusOverride(recordId, newStatus) {
    const records = window.db.getRecords();
    const idx = records.findIndex(r => r.id === recordId);
    if (idx === -1) return;

    records[idx].status = newStatus;
    
    // Clear time if changed to Absent, or add simulated time if changed to Present/Late without existing check-in time
    if (newStatus === 'Absent') {
      records[idx].checkin_time = '';
      records[idx].checkin_method = 'Manual';
      records[idx].note = 'ไม่มีการเช็คชื่อเข้าเรียน (เปลี่ยนด้วยตนเอง)';
    } else if (!records[idx].checkin_time) {
      records[idx].checkin_time = new Date().toISOString();
      records[idx].checkin_method = 'Manual';
      records[idx].note = 'เช็คชื่อโดยอาจารย์';
    }

    localStorage.setItem('attendance_records', JSON.stringify(records));
    window.UIComponents.showToast('ปรับปรุงสถานะการเข้าเรียนสำเร็จ');
    this.render();
  },

  handleSaveNote(recordId, text) {
    const records = window.db.getRecords();
    const idx = records.findIndex(r => r.id === recordId);
    if (idx === -1) return;

    // Check if changed
    if (records[idx].note === text) return;

    records[idx].note = text.trim();
    localStorage.setItem('attendance_records', JSON.stringify(records));
    window.UIComponents.showToast('บันทึกหมายเหตุสำเร็จ');
    // We don't call full re-render on blur to avoid losing element focus awkwardly.
  },

  exportToCSV() {
    if (!this.selectedSessionId) return;

    const currentSession = window.db.getSessionById(this.selectedSessionId);
    const currentCourse = window.db.getCourseById(this.selectedCourseId);
    if (!currentSession || !currentCourse) return;

    const recordsToExport = window.db.getRecordsBySession(this.selectedSessionId);

    // Build CSV Content
    const headers = ['ลำดับ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'เวลาเช็คชื่อ', 'วิธีการเช็คชื่อ', 'สถานะ', 'หมายเหตุ'];
    
    const rows = recordsToExport.map((r, index) => {
      const timeStr = r.checkin_time ? new Date(r.checkin_time).toLocaleTimeString('th-TH') : '-';
      
      let statusLabel = 'มาเรียน';
      if (r.status === 'Late') statusLabel = 'สาย';
      else if (r.status === 'Absent') statusLabel = 'ขาดเรียน';
      else if (r.status === 'Excused') statusLabel = 'ลาเรียน';

      return [
        index + 1,
        `="${r.student_id}"`, // wraps ID in formula to preserve leading zeroes in Excel!
        r.student_name,
        timeStr,
        r.checkin_time ? r.checkin_method : '-',
        statusLabel,
        r.note || ''
      ];
    });

    // Merge CSV with commas, wrap fields in quotes
    let csvString = headers.join(',') + '\n';
    rows.forEach(row => {
      csvString += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    // Write file using standard browser download blob
    // Prefixed with UTF-8 BOM (\uFEFF) to make Excel load Thai characters perfectly!
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    // File name: EN-013-333_Lab-Session-Code_Roster.csv
    const fileName = `${currentCourse.course_code}_Session_${currentSession.session_code}_Attendance.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.UIComponents.showToast('ดาวน์โหลดรายงาน CSV สำเร็จแล้ว!');
  }
};

window.ReportsView = ReportsView;
