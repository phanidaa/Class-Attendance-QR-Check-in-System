/*
   Class Attendance QR Check-in System - Student Check-in View
   Provides manual code forms, simulated QR scanners, validations, and custom check-in success badges.
*/

const CheckinView = {
  mockScannerTimeout: null,

  render(prefilledCode = '') {
    const content = `
      <div class="student-checkin-wrapper">
        <div class="checkin-hero-banner">
          <h2>ระบบเช็คชื่อเข้าห้องเรียน</h2>
          <p>Class Attendance Check-in for Lab Room</p>
        </div>
        
        <div class="checkin-body" id="checkin-form-container">
          <form id="checkin-main-form" onsubmit="CheckinView.handleSubmit(event)">
            
            <div class="form-group">
              <label class="form-label" for="chk-code">รหัสเช็คชื่อ / รหัส Session (4-8 หลัก)</label>
              <div style="display: flex; gap: 0.5rem;">
                <input class="form-control" type="text" id="chk-code" 
                  style="font-family: monospace; font-size: 1.2rem; text-transform: uppercase; font-weight: 700; text-align: center; letter-spacing: 1px;" 
                  value="${prefilledCode.toUpperCase()}" placeholder="เช่น A9X3-F8KL" required />
                
                <button class="btn btn-secondary" type="button" onclick="CheckinView.toggleMockScanner()" title="สแกนด้วยกล้อง">
                  <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                </button>
              </div>
            </div>

            <!-- Mock Camera Scanner Drawer (Hidden by default) -->
            <div id="mock-scanner-drawer" class="d-none">
              <div class="mock-scanner-container" onclick="CheckinView.triggerMockScanDetection()">
                <div class="mock-scanner-line"></div>
                <div class="scanner-cam-icon">📷</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-crimson);">กำลังเปิดกล้องจำลองการสแกน...</div>
                <div class="text-muted mt-1" style="font-size: 0.75rem;">(คลิกกล่องสีแดงเพื่อจำลองการหันกล้องสแกน QR Code)</div>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="chk-stud-id">รหัสนักศึกษา (Student ID)</label>
              <input class="form-control" type="text" id="chk-stud-id" placeholder="เช่น 66010101" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="chk-name">ชื่อ-นามสกุล (Full Name)</label>
              <input class="form-control" type="text" id="chk-name" placeholder="เช่น เกียรติศักดิ์ อุดมดี" required />
            </div>

            <button class="btn btn-primary w-full mt-2" type="submit" style="padding: 0.8rem; font-size: 1.05rem;">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ยืนยันการเช็คชื่อเข้าเรียน (Check-in)
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;
  },

  toggleMockScanner() {
    const drawer = document.getElementById('mock-scanner-drawer');
    if (drawer) {
      drawer.classList.toggle('d-none');
    }
  },

  triggerMockScanDetection() {
    const container = document.querySelector('.mock-scanner-container');
    if (!container) return;

    container.innerHTML = `
      <div class="mock-scanner-line"></div>
      <div style="font-size: 3rem;">⚡</div>
      <div class="font-semibold" style="color: var(--color-present);">สแกน QR Code สำเร็จ!</div>
      <div class="text-muted mt-1" style="font-size: 0.75rem;">กำลังถอดรหัสและดึงข้อมูลรอบเช็คชื่อ...</div>
    `;

    this.mockScannerTimeout = setTimeout(() => {
      // Pick a random open session if available
      const sessions = window.db.getSessions().filter(s => s.status === 'Open');
      
      let code = '';
      if (sessions.length > 0) {
        code = sessions[0].session_code;
      } else {
        // Fallback mockup code
        code = 'DOMB-7V8L';
      }

      document.getElementById('chk-code').value = code.toUpperCase();
      this.toggleMockScanner();
      window.UIComponents.showToast('ดึงข้อมูลรหัสสแกนอัตโนมัติสำเร็จ!');
      
      // Focus student id next
      document.getElementById('chk-stud-id').focus();
    }, 1500);
  },

  handleSubmit(e) {
    e.preventDefault();

    const code = document.getElementById('chk-code').value.trim();
    const studentId = document.getElementById('chk-stud-id').value.trim();
    const studentName = document.getElementById('chk-name').value.trim();

    try {
      // Process database checkin logic
      const record = window.db.checkinStudent(code, studentId, studentName);
      
      // Render beautiful success sheet
      this.renderSuccess(record);
      window.UIComponents.showToast('เช็คชื่อสำเร็จเรียบร้อย!');
    } catch (err) {
      alert(`ล้มเหลว: ${err.message}`);
    }
  },

  renderSuccess(record) {
    const container = document.getElementById('checkin-form-container');
    if (!container) return;

    const session = window.db.getSessionById(record.session_id);
    const course = window.db.getCourseById(record.course_id);
    
    let statusClass = 'badge-present';
    let statusLabel = 'มาเรียนตรงเวลา';
    if (record.status === 'Late') {
      statusClass = 'badge-late';
      statusLabel = 'มาสาย';
    }

    const checkinTimeStr = new Date(record.checkin_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    container.innerHTML = `
      <div class="checkin-success-card">
        <div class="success-icon-check">✓</div>
        
        <h3 class="mb-3" style="color: var(--color-present); font-size: 1.4rem;">บันทึกการเช็คชื่อเข้าเรียนสำเร็จ</h3>
        
        <div style="background-color: var(--color-chalk); border-radius: var(--radius-lg); padding: 1.25rem 1rem; text-align: left; border: 1px solid var(--color-chalk-dark); margin-bottom: 1.5rem;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">รายละเอียดรายวิชา</div>
          <div class="font-semibold" style="font-size: 1.05rem; color: var(--color-text-main); margin-bottom: 0.5rem;">${course.course_code} - ${course.course_name}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">หัวข้อ: ${session.session_title}</div>
          
          <hr style="border: 0; border-top: 1px solid var(--color-chalk-dark); margin: 0.75rem 0;" />
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
            <div>
              <span class="text-muted">นักศึกษา:</span>
              <div class="font-semibold">${record.student_name}</div>
            </div>
            <div>
              <span class="text-muted">รหัสนักศึกษา:</span>
              <div class="font-semibold">${record.student_id}</div>
            </div>
          </div>
          
          <hr style="border: 0; border-top: 1px solid var(--color-chalk-dark); margin: 0.75rem 0;" />

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="text-muted">เวลาลงทะเบียน:</span>
              <div class="font-semibold" style="font-size: 0.95rem;">${checkinTimeStr} น.</div>
            </div>
            <div>
              <span class="badge ${statusClass}" style="font-size: 0.85rem; padding: 0.35rem 0.8rem;">${statusLabel}</span>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary w-full" onclick="CheckinView.render()" style="padding: 0.65rem;">
          <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
          ทำรายการเช็คชื่ออื่นๆ ต่อ
        </button>
      </div>
    `;
  }
};

window.CheckinView = CheckinView;
