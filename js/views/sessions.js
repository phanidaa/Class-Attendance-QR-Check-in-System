/*
   Class Attendance QR Check-in System - Attendance Session View
   Manages session listings, creation dialogs, live QR displays, timer meters, and live check-in feeds.
*/

const SessionsView = {
  sessionModal: null,
  activeQRModal: null,
  qrTimerInterval: null,
  liveFeedInterval: null,
  
  // Track open session ID for QR page
  activeQRSessionId: null,

  render() {
    const courses = window.db.getCourses();
    const sessions = window.db.getSessions();
    const records = window.db.getRecords();

    // Map course metadata for easy listing
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = c; });

    const content = `
      <div class="content-card mb-3">
        <div class="card-header">
          <div class="card-title">
            <h3>รอบเช็คชื่อห้องเรียน (Attendance Sessions)</h3>
          </div>
          <div class="card-actions">
            ${courses.length > 0 ? `
              <button class="btn btn-primary btn-sm" id="btn-add-session">
                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                สร้างรอบเช็คชื่อ
              </button>
            ` : ''}
          </div>
        </div>
        <p class="text-muted" style="font-size: 0.9rem;">อาจารย์ผู้สอนสามารถสร้างรอบเช็คชื่อ เปิดแสดงหน้าจอ QR Code เพื่อสแกน และติดตามการเข้าเรียนของนักศึกษาแบบ Real-time</p>
      </div>

      <div class="items-list-grid">
        ${sessions.length === 0 ? `
          <div class="content-card text-center" style="grid-column: 1/-1; padding: 3rem;">
            <p class="text-muted mb-2">ยังไม่มีการสร้างรอบการเช็คชื่อในระบบ</p>
            ${courses.length > 0 
              ? `<button class="btn btn-primary" onclick="SessionsView.openAddModal()">สร้างรอบแรกทันที</button>` 
              : `<button class="btn btn-primary" onclick="window.appRouter('courses')">สร้างวิชาเรียนก่อนเริ่มเช็คชื่อ</button>`
            }
          </div>
        ` : [...sessions].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(s => {
          const course = courseMap[s.course_id] || { course_code: 'ERR', course_name: 'Unknown', max_students: 40 };
          const sessionRecords = records.filter(r => r.session_id === s.id);
          const checkedIn = sessionRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
          const capacity = course.max_students || 40;

          let badgeClass = 'badge-closed';
          let statusTh = 'ปิดเช็คชื่อ';
          if (s.status === 'Open') { badgeClass = 'badge-present'; statusTh = 'เปิดรับสแกน'; }
          else if (s.status === 'Cancelled') { badgeClass = 'badge-cancelled'; statusTh = 'ยกเลิกคาบ'; }

          return `
            <div class="item-card">
              <div>
                <div class="item-card-header">
                  <span class="item-card-code" style="background-color: var(--color-crimson-light); color: var(--color-crimson);">${s.session_code}</span>
                  <span class="badge ${badgeClass}">${statusTh}</span>
                </div>
                <h4 class="item-card-title mb-2" style="font-size: 1rem;">${s.session_title}</h4>
                <div class="item-card-detail">
                  <div style="font-weight: 600; color: var(--color-text-main); margin-bottom: 0.25rem;">${course.course_code} - ${course.course_name}</div>
                  <div>วันที่เรียน: ${new Date(s.session_date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</div>
                  <div>เวลา: ${s.start_time} - ${s.end_time} น. (สายหลัง ${s.late_after_minutes} นาที)</div>
                  
                  <div class="mt-2" style="background-color: var(--color-chalk); border-radius: var(--radius-sm); padding: 0.4rem 0.75rem; display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted);">เข้าเรียนแล้ว</span>
                    <span style="font-size: 0.85rem; font-weight: 800; color: var(--color-present);">${checkedIn} / ${capacity} คน</span>
                  </div>
                </div>
              </div>
              <div class="item-card-actions" style="flex-wrap: wrap;">
                ${s.status === 'Open' ? `
                  <button class="btn btn-primary btn-sm" onclick="SessionsView.openQRDisplay('${s.id}')" style="flex: 1; padding: 0.4rem;">
                    <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /></svg>
                    จอ QR
                  </button>
                ` : ''}
                
                <button class="btn btn-secondary btn-sm" onclick="SessionsView.toggleSessionStatus('${s.id}')" title="เปลี่ยนสถานะ">
                  ${s.status === 'Open' ? 'ปิดคาบ' : 'เปิดเช็คชื่อ'}
                </button>
                
                <button class="btn btn-danger btn-sm" onclick="SessionsView.handleDelete('${s.id}', '${s.session_title}')">
                  <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Add Session Modal -->
      <div class="modal-overlay" id="session-modal">
        <div class="modal-window">
          <div class="modal-header">
            <h3>สร้างรอบเช็คชื่อเข้าเรียน</h3>
            <button class="modal-close">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form id="session-form" onsubmit="SessionsView.handleSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="se-course">วิชาเรียน</label>
                <select class="form-control" id="se-course" required>
                  ${courses.map(c => `
                    <option value="${c.id}">${c.course_code} - ${c.course_name} (Sec ${c.section})</option>
                  `).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="se-title">หัวข้อรอบการเช็คชื่อ</label>
                <input class="form-control" type="text" id="se-title" placeholder="เช่น Lab 01: เริ่มต้นเขียน HTML" required />
              </div>
              
              <div class="form-group">
                <label class="form-label" for="se-date">วันที่เรียน</label>
                <input class="form-control" type="date" id="se-date" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="se-start">เวลาเริ่มเปิดเช็คชื่อ</label>
                  <input class="form-control" type="time" id="se-start" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="se-end">เวลาปิดเช็คชื่อ</label>
                  <input class="form-control" type="time" id="se-end" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="se-late">สถานะ 'สาย' หลังจากเริ่มเปิด (นาที)</label>
                <input class="form-control" type="number" id="se-late" min="1" max="120" value="15" required />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" data-modal-action="cancel">ยกเลิก</button>
              <button class="btn btn-primary" type="submit">เปิดรอบเช็คชื่อ</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Live QR Display Overlay -->
      <div class="modal-overlay" id="qr-modal" style="background-color: var(--color-chalk);">
        <div class="modal-window" style="max-width: 900px; width: 95%; background-color: var(--color-chalk-light);">
          <div class="modal-header" style="background-color: white;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge badge-present" style="animation: pulse 1.5s infinite;">● REALTIME MONITOR</span>
              <h3 id="qr-modal-title" style="margin-left: 0.5rem;">Lab 03: JavaScript DOM</h3>
            </div>
            <button class="modal-close" onclick="SessionsView.closeQRDisplay()">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="modal-body qr-monitor-layout">
            
            <!-- Left Side: QR Display & Session Codes -->
            <div class="qr-display-container" style="background-color: white; border-radius: var(--radius-lg); border: 1px solid var(--color-chalk-dark); padding: 2rem 1.5rem;">
              <p class="text-muted mb-2" style="font-size: 0.85rem; font-weight: 700;">สแกนเพื่อเช็คชื่อเข้าห้องเรียน (QR Code)</p>
              
              <!-- Canvas Container -->
              <div class="qr-canvas-wrapper" id="live-qr-canvas-wrapper" style="box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 1rem; border-radius: var(--radius-md);"></div>
              
              <div class="text-muted mt-2" style="font-size: 0.8rem;">หรือกรอกรหัสยืนยันตัวตนในระบบ</div>
              <div class="session-code-display" id="live-session-code-display">A9X3-F8KL</div>
              
              <!-- Countdown timer and stats -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; margin-top: 1rem;">
                <div style="background-color: var(--color-chalk); border-radius: var(--radius-md); padding: 0.6rem 0.5rem; text-align: center;">
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">เวลาที่เหลืออยู่</div>
                  <div id="live-countdown-timer" style="font-size: 1.2rem; font-weight: 800; color: var(--color-crimson);">00:00</div>
                </div>
                <div style="background-color: var(--color-chalk); border-radius: var(--radius-md); padding: 0.6rem 0.5rem; text-align: center;">
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">เข้าเรียนแล้ว</div>
                  <div id="live-checkin-ratio" style="font-size: 1.2rem; font-weight: 800; color: var(--color-present);">0 / 0 คน</div>
                </div>
              </div>
            </div>

            <!-- Right Side: Real-time Live Checked-in Feed -->
            <div class="content-card" style="margin-bottom: 0; box-shadow: none; border: 1px solid var(--color-chalk-dark); max-height: 480px;">
              <div class="card-header" style="padding: 0.5rem 0 0.75rem 0;">
                <div class="card-title">
                  <h3 style="font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                    <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; stroke: var(--color-present); fill: none;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    รายชื่อนักศึกษาที่สแกนสำเร็จแล้ว
                  </h3>
                </div>
              </div>
              
              <div id="live-feed-list" style="overflow-y: auto; flex: 1; min-height: 250px; display: flex; flex-direction: column; gap: 0.6rem; padding-right: 0.25rem;">
                <!-- Filled dynamically -->
              </div>
            </div>

          </div>

          <div class="modal-footer" style="background-color: white;">
            <button class="btn btn-secondary" onclick="SessionsView.handleExtendSession()">+ ขยายเวลา 5 นาที</button>
            <button class="btn btn-primary" onclick="SessionsView.closeQRDisplay()">เสร็จสิ้นและปิดหน้าจอ</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;

    // Init Modal Add
    this.sessionModal = window.UIComponents.initModal('session-modal');

    // Wire up show add session
    const addBtn = document.getElementById('btn-add-session');
    if (addBtn) {
      addBtn.onclick = () => this.openAddModal();
    }
  },

  openAddModal() {
    document.getElementById('session-form').reset();
    
    // Set default date as today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('se-date').value = today;

    // Set default open start/end times
    const now = new Date();
    const startH = String(now.getHours()).padStart(2, '0');
    const startM = String(now.getMinutes()).padStart(2, '0');
    
    const later = new Date(now.getTime() + 3 * 60 * 60 * 1000); // end 3 hours later
    const endH = String(later.getHours()).padStart(2, '0');
    const endM = String(later.getMinutes()).padStart(2, '0');

    document.getElementById('se-start').value = `${startH}:${startM}`;
    document.getElementById('se-end').value = `${endH}:${endM}`;

    this.sessionModal.open();
  },

  handleSubmit(e) {
    e.preventDefault();

    const sessionData = {
      course_id: document.getElementById('se-course').value,
      session_title: document.getElementById('se-title').value.trim(),
      session_date: document.getElementById('se-date').value,
      start_time: document.getElementById('se-start').value,
      end_time: document.getElementById('se-end').value,
      late_after_minutes: parseInt(document.getElementById('se-late').value),
      status: 'Open' // auto-open on creation
    };

    try {
      const created = window.db.saveSession(sessionData);
      window.UIComponents.showToast('เปิดรอบเช็คชื่อห้องเรียนแล้ว!');
      this.sessionModal.close();
      
      // Auto open the QR code panel for the newly created session
      this.openQRDisplay(created.id);
    } catch (err) {
      alert('ไม่สามารถบันทึกรอบเช็คชื่อได้: ' + err.message);
    }
  },

  toggleSessionStatus(id) {
    const s = window.db.getSessionById(id);
    if (!s) return;

    s.status = s.status === 'Open' ? 'Closed' : 'Open';
    window.db.saveSession(s);
    window.UIComponents.showToast(`เปลี่ยนสถานะรอบเช็คชื่อเป็น: ${s.status === 'Open' ? 'เปิดรับสแกน' : 'ปิดรับสแกน'}`);
    this.render();
  },

  handleDelete(id, title) {
    if (confirm(`คุณต้องการลบรอบเช็คชื่อ "${title}" หรือไม่?\nข้อมูลการเช็คชื่อทั้งหมดในรอบนี้จะถูกลบถาวร!`)) {
      window.db.deleteSession(id);
      window.UIComponents.showToast('ลบรอบเช็คชื่อสำเร็จแล้ว', 'error');
      this.render();
    }
  },

  // Real-time Display QR code page
  openQRDisplay(id) {
    const s = window.db.getSessionById(id);
    if (!s) return;

    this.activeQRSessionId = id;
    
    // Set titles
    document.getElementById('qr-modal-title').innerText = s.session_title;
    document.getElementById('live-session-code-display').innerText = s.session_code;

    // Render QR Code linking directly to the Student Check-in screen with auto-filled session code parameter
    // Generate URL based on browser current address
    const baseUrl = window.location.href.split('?')[0];
    const checkinUrl = `${baseUrl}?session=${s.session_code}`;
    
    window.UIComponents.generateQRCode('live-qr-canvas-wrapper', checkinUrl);

    // Show QR modal overlay
    const qrModalEl = document.getElementById('qr-modal');
    this.activeQRModal = window.UIComponents.initModal('qr-modal', {
      onClose: () => this.stopLiveMonitor()
    });
    
    this.activeQRModal.open();

    // Start realtime timer and checked-in list polling
    this.startLiveMonitor(s);
  },

  closeQRDisplay() {
    if (this.activeQRModal) {
      this.activeQRModal.close();
      this.stopLiveMonitor();
      this.render(); // update background main list
    }
  },

  startLiveMonitor(session) {
    // 1. Countdown timer logic
    const updateCountdown = () => {
      const s = window.db.getSessionById(session.id); // re-fetch to get live adjustments
      if (!s || s.status !== 'Open') {
        document.getElementById('live-countdown-timer').innerText = 'CLOSED';
        return;
      }

      const now = new Date();
      const [endH, endM] = s.end_time.split(':').map(Number);
      const sessionEnd = new Date(s.session_date);
      sessionEnd.setHours(endH, endM, 0);

      const diffMs = sessionEnd - now;
      if (diffMs <= 0) {
        document.getElementById('live-countdown-timer').innerText = 'หมดเวลา';
        
        // Auto-close session if timer naturally expires
        s.status = 'Closed';
        window.db.saveSession(s);
        return;
      }

      const diffSecs = Math.floor(diffMs / 1000);
      const hrs = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;

      const timeString = hrs > 0 
        ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      document.getElementById('live-countdown-timer').innerText = timeString;
    };

    updateCountdown();
    this.qrTimerInterval = setInterval(updateCountdown, 1000);

    // 2. Real-time Live checked-in lists feed updater
    const updateCheckedInList = () => {
      const s = window.db.getSessionById(session.id);
      if (!s) return;

      const allRecords = window.db.getRecordsBySession(s.id);
      const checkedInRecs = allRecords
        .filter(r => r.checkin_time !== '')
        .sort((a, b) => new Date(b.checkin_time) - new Date(a.checkin_time)); // newest first

      // Update count ratio based on course capacity
      const course = window.db.getCourseById(s.course_id);
      const capacity = course ? (course.max_students || 40) : 40;
      document.getElementById('live-checkin-ratio').innerText = `${checkedInRecs.length} / ${capacity} คน`;

      // Render Feed list
      const feedContainer = document.getElementById('live-feed-list');
      if (checkedInRecs.length === 0) {
        feedContainer.innerHTML = `
          <div class="text-center text-muted" style="padding: 3rem 1rem; border: 1px dashed var(--color-chalk-dark); border-radius: var(--radius-md);">
            ยังไม่มีผู้สแกนเช็คชื่อในขณะนี้...
          </div>
        `;
        return;
      }

      feedContainer.innerHTML = checkedInRecs.map((r, index) => {
        const checkinDate = new Date(r.checkin_time);
        const timeStr = checkinDate.toLocaleTimeString('th-TH');
        
        let statusBadge = `<span class="badge badge-present">มาเรียน</span>`;
        if (r.status === 'Late') {
          statusBadge = `<span class="badge badge-late">สาย</span>`;
        }

        // Add a flashy animation class only to the newly added records (first item in list)
        const isNewest = index === 0 ? 'style="animation: flashGreen 1s ease;"' : '';

        return `
          <div class="stat-card" ${isNewest} style="padding: 0.65rem 1rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--color-chalk-dark); display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.75rem; background-color: var(--color-crimson); font-weight: 700;">
                ${r.student_name.substring(0, 1)}
              </div>
              <div style="text-align: left;">
                <div class="font-semibold" style="font-size: 0.85rem; line-height: 1.2;">${r.student_name}</div>
                <div class="text-muted" style="font-size: 0.75rem;">รหัส: ${r.student_id} | เวลา: ${timeStr} น.</div>
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>
        `;
      }).join('');
    };

    updateCheckedInList();
    this.liveFeedInterval = setInterval(updateCheckedInList, 1500); // poll every 1.5 seconds for LocalStorage updates
  },

  stopLiveMonitor() {
    if (this.qrTimerInterval) clearInterval(this.qrTimerInterval);
    if (this.liveFeedInterval) clearInterval(this.liveFeedInterval);
  },

  handleExtendSession() {
    const s = window.db.getSessionById(this.activeQRSessionId);
    if (!s) return;

    // Extend end time by 5 minutes
    const [endH, endM] = s.end_time.split(':').map(Number);
    const dateObj = new Date(s.session_date);
    dateObj.setHours(endH, endM + 5);

    const extH = String(dateObj.getHours()).padStart(2, '0');
    const extM = String(dateObj.getMinutes()).padStart(2, '0');
    
    s.end_time = `${extH}:${extM}`;
    
    // Save to storage
    window.db.saveSession(s);
    window.UIComponents.showToast('ขยายเวลาเช็คชื่อเพิ่มอีก 5 นาทีเรียบร้อย!');
  }
};

// Add raw CSS keyframe animations dynamically to support live monitor flash effects
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes flashGreen {
    0% { background-color: rgba(45, 106, 79, 0.25); border-color: var(--color-present); transform: scale(1.02); }
    100% { background-color: white; border-color: var(--color-chalk-dark); transform: scale(1); }
  }
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;
document.head.appendChild(styleSheet);

window.SessionsView = SessionsView;
