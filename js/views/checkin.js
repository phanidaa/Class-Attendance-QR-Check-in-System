/*
   Class Attendance QR Check-in System - Student Check-in View
   Provides manual code forms, mobile camera QR scanners, GPS geolocation capture, and success views.
*/

const CheckinView = {
  mockScannerTimeout: null,
  html5QrCode: null,
  activeTab: 'real', // 'real' or 'mock'

  render(prefilledCode = '') {
    // Stop camera if view is redrawn
    this.stopCamera();

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
                
                <button class="btn btn-secondary" type="button" onclick="CheckinView.toggleScannerDrawer()" title="สแกนด้วยกล้อง">
                  <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                </button>
              </div>
            </div>

            <!-- Real/Mock Scanner Drawer (Hidden by default) -->
            <div id="scanner-drawer" class="d-none" style="margin-top: 1rem;">
              <div style="display: flex; border: 1px solid var(--color-chalk-dark); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 0.75rem;">
                <button type="button" class="btn btn-sm" id="btn-tab-real-cam" onclick="CheckinView.switchScannerTab('real')" style="flex: 1; border-radius: 0; border: none; background-color: var(--color-crimson); color: white; font-weight: 700;">📷 สแกนกล้องจริง</button>
                <button type="button" class="btn btn-sm btn-secondary" id="btn-tab-mock-cam" onclick="CheckinView.switchScannerTab('mock')" style="flex: 1; border-radius: 0; border: none; background-color: transparent; color: var(--color-text-muted);">⚙️ เครื่องจำลอง</button>
              </div>

              <!-- Real Camera Scanner Container -->
              <div id="real-scanner-container" style="border: 2px solid var(--color-crimson); border-radius: var(--radius-lg); overflow: hidden; background-color: #000; position: relative;">
                <div id="qr-reader" style="width: 100%; min-height: 250px;"></div>
                <div class="mock-scanner-line" style="pointer-events: none;"></div>
              </div>

              <!-- Mock Scanner Container -->
              <div id="mock-scanner-container" class="d-none" onclick="CheckinView.triggerMockScanDetection()" style="border: 2px dashed var(--color-crimson); border-radius: var(--radius-lg); padding: 2rem 1rem; position: relative; background-color: rgba(220, 20, 60, 0.02); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition-fast);">
                <div class="mock-scanner-line"></div>
                <div class="scanner-cam-icon" style="font-size: 3rem; color: var(--color-crimson); margin-bottom: 0.75rem;">⚙️</div>
                <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-crimson);">คลิกในกล่องเพื่อจำลองสแกน QR Code</div>
                <div class="text-muted mt-1" style="font-size: 0.75rem;">(จำลองการตรวจพบรอบเรียนเปิดอยู่)</div>
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

            <button class="btn btn-primary w-full mt-2" type="submit" id="btn-submit-checkin" style="padding: 0.8rem; font-size: 1.05rem;">
              <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>ยืนยันการเช็คชื่อเข้าเรียน (Check-in)</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;
  },

  // Toggle open/close scanner
  toggleScannerDrawer() {
    const drawer = document.getElementById('scanner-drawer');
    if (!drawer) return;

    if (drawer.classList.contains('d-none')) {
      drawer.classList.remove('d-none');
      if (this.activeTab === 'real') {
        this.startRealCamera();
      }
    } else {
      drawer.classList.add('d-none');
      this.stopCamera();
    }
  },

  // Switch scanner tab
  switchScannerTab(type) {
    this.activeTab = type;
    
    const realTabBtn = document.getElementById('btn-tab-real-cam');
    const mockTabBtn = document.getElementById('btn-tab-mock-cam');
    const realContainer = document.getElementById('real-scanner-container');
    const mockContainer = document.getElementById('mock-scanner-container');

    if (type === 'real') {
      realTabBtn.style.backgroundColor = 'var(--color-crimson)';
      realTabBtn.style.color = 'white';
      realTabBtn.style.fontWeight = '700';
      mockTabBtn.style.backgroundColor = 'transparent';
      mockTabBtn.style.color = 'var(--color-text-muted)';
      mockTabBtn.style.fontWeight = '500';

      realContainer.classList.remove('d-none');
      mockContainer.classList.add('d-none');
      this.startRealCamera();
    } else {
      mockTabBtn.style.backgroundColor = 'var(--color-crimson)';
      mockTabBtn.style.color = 'white';
      mockTabBtn.style.fontWeight = '700';
      realTabBtn.style.backgroundColor = 'transparent';
      realTabBtn.style.color = 'var(--color-text-muted)';
      realTabBtn.style.fontWeight = '500';

      mockContainer.classList.remove('d-none');
      realContainer.classList.add('d-none');
      this.stopCamera();
    }
  },

  // Start Real Mobile Camera Scanner
  startRealCamera() {
    this.stopCamera();

    setTimeout(() => {
      try {
        if (typeof Html5Qrcode === 'undefined') {
          console.error("Html5Qrcode library not loaded yet.");
          document.getElementById('qr-reader').innerHTML = `
            <div style="color: white; padding: 2rem; text-align: center;">
              ไม่สามารถโหลดโมดูลกล้องได้ กรุณาเชื่อมต่ออินเทอร์เน็ตเพื่อโหลด CDN
            </div>
          `;
          return;
        }

        this.html5QrCode = new Html5Qrcode("qr-reader");
        this.html5QrCode.start(
          { facingMode: "environment" }, // back camera by default
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            // QR Code Decoded!
            console.log(`Scanned QR Code: ${decodedText}`);
            
            // Extract session code from URL query string if present, or use raw code
            let sessionCode = decodedText.trim();
            if (decodedText.includes('session=')) {
              try {
                const url = new URL(decodedText);
                sessionCode = url.searchParams.get('session') || sessionCode;
              } catch (e) {
                // Not a valid URL, fallback to raw string
              }
            }

            document.getElementById('chk-code').value = sessionCode.toUpperCase();
            this.toggleScannerDrawer(); // Close camera drawer
            window.UIComponents.showToast('ดึงรหัสเข้าเรียนผ่านกล้องสำเร็จ!');
            document.getElementById('chk-stud-id').focus();
          },
          (errorMessage) => {
            // Silence frame scan errors to prevent log flooding
          }
        ).catch(err => {
          console.warn("Unable to start Html5Qrcode:", err);
          document.getElementById('qr-reader').innerHTML = `
            <div style="color: white; padding: 2rem; text-align: center; font-size: 0.85rem;">
              ไม่สามารถเข้าถึงกล้องได้: <br>${err}<br><br>
              <span style="color: var(--color-sky-highlight);">กรุณาอนุญาตสิทธิ์การใช้งานกล้องในบราวเซอร์ หรือเปลี่ยนไปใช้ระบบจำลอง (เครื่องจำลอง)</span>
            </div>
          `;
        });
      } catch (e) {
        console.error("Camera start exception:", e);
      }
    }, 100);
  },

  // Stop camera feed
  stopCamera() {
    if (this.html5QrCode && this.html5QrCode.isScanning) {
      this.html5QrCode.stop().then(() => {
        this.html5QrCode = null;
        console.log("Camera scanning stopped.");
      }).catch(err => {
        console.error("Error stopping camera scan:", err);
      });
    }
  },

  // Mock scan simulator
  triggerMockScanDetection() {
    const container = document.getElementById('mock-scanner-container');
    if (!container) return;

    container.innerHTML = `
      <div class="mock-scanner-line"></div>
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚡</div>
      <div class="font-semibold" style="color: var(--color-present);">จำลองการสแกนสำเร็จ!</div>
      <div class="text-muted mt-1" style="font-size: 0.75rem;">กำลังถอดรหัสและดึงข้อมูลรอบเรียน...</div>
    `;

    this.mockScannerTimeout = setTimeout(() => {
      // Pick a random open session
      const sessions = window.db.getSessions().filter(s => s.status === 'Open');
      let code = '';
      if (sessions.length > 0) {
        code = sessions[0].session_code;
      } else {
        code = 'DOMB-7V8L'; // Fallback
      }

      document.getElementById('chk-code').value = code.toUpperCase();
      this.toggleScannerDrawer();
      window.UIComponents.showToast('จำลองดึงรหัสสแกนสำเร็จ!');
      
      // Reset mock container HTML
      container.innerHTML = `
        <div class="mock-scanner-line"></div>
        <div class="scanner-cam-icon" style="font-size: 3rem; color: var(--color-crimson); margin-bottom: 0.75rem;">⚙️</div>
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-crimson);">คลิกในกล่องเพื่อจำลองสแกน QR Code</div>
        <div class="text-muted mt-1" style="font-size: 0.75rem;">(จำลองการตรวจพบรอบเรียนเปิดอยู่)</div>
      `;

      document.getElementById('chk-stud-id').focus();
    }, 1200);
  },

  // GPS verification and Check-in submit
  handleSubmit(e) {
    e.preventDefault();
    this.stopCamera(); // Make sure camera is closed on submit

    const code = document.getElementById('chk-code').value.trim();
    const studentId = document.getElementById('chk-stud-id').value.trim();
    const studentName = document.getElementById('chk-name').value.trim();

    const submitBtn = document.getElementById('btn-submit-checkin');
    const submitBtnSpan = submitBtn.querySelector('span');

    // Update UI button state to represent GPS loading
    submitBtn.disabled = true;
    submitBtnSpan.innerText = 'กำลังดึงตำแหน่ง GPS ของคุณ...';
    window.UIComponents.showToast('ระบบกำลังขอพิกัด GPS เพื่อป้องกันการเช็คชื่อนอกห้องเรียน...', 'info');

    const executeCheckin = (gpsCoords = null) => {
      try {
        const record = window.db.checkinStudent(code, studentId, studentName, gpsCoords);
        this.renderSuccess(record);
        window.UIComponents.showToast('เช็คชื่อเข้าห้องเรียนและบันทึก GPS สำเร็จ!');
      } catch (err) {
        alert(`การเช็คชื่อล้มเหลว: ${err.message}`);
        // Restore button state
        submitBtn.disabled = false;
        submitBtnSpan.innerText = 'ยืนยันการเช็คชื่อเข้าเรียน (Check-in)';
      }
    };

    // Geolocation retrieval
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          executeCheckin(coords);
        },
        (error) => {
          console.warn("Geolocation acquisition error code:", error.code);
          let errorMsg = 'ไม่สามารถอ่านตำแหน่งที่ตั้งได้';
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = 'คุณปฏิเสธสิทธิ์การเข้าถึงตำแหน่ง GPS กรุณาอนุญาตสิทธิ์ตำแหน่งที่ตั้งในเบราว์เซอร์ เพื่อความโปร่งใสในการสแกนเข้าห้องเรียน';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = 'ไม่สามารถดึงข้อมูลพิกัด GPS ในตำแหน่งนี้ได้';
          } else if (error.code === error.TIMEOUT) {
            errorMsg = 'ดึงตำแหน่ง GPS ล้มเหลวเนื่องจากหมดเวลาเชื่อมต่อ';
          }
          
          alert(`เกิดข้อผิดพลาด GPS: ${errorMsg}`);
          submitBtn.disabled = false;
          submitBtnSpan.innerText = 'ยืนยันการเช็คชื่อเข้าเรียน (Check-in)';
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS');
      submitBtn.disabled = false;
      submitBtnSpan.innerText = 'ยืนยันการเช็คชื่อเข้าเรียน (Check-in)';
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
    
    // GPS UI formatting
    const gpsString = record.gps_coords 
      ? `<a href="https://www.google.com/maps?q=${record.gps_coords.latitude},${record.gps_coords.longitude}" target="_blank" style="color: var(--color-crimson); font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
           📍 ${record.gps_coords.latitude.toFixed(6)}, ${record.gps_coords.longitude.toFixed(6)}
         </a>`
      : '<span class="text-muted">ไม่ระบุตำแหน่ง</span>';

    container.innerHTML = `
      <div class="checkin-success-card">
        <div class="success-icon-check">✓</div>
        
        <h3 class="mb-3" style="color: var(--color-present); font-size: 1.4rem;">บันทึกการเช็คชื่อเข้าเรียนสำเร็จ</h3>
        
        <div style="background-color: var(--color-chalk); border-radius: var(--radius-lg); padding: 1.25rem 1rem; text-align: left; border: 1px solid var(--color-chalk-dark); margin-bottom: 1.5rem;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">รายละเอียดรายวิชา</div>
          <div class="font-semibold" style="font-size: 1.05rem; color: var(--color-text-main); margin-bottom: 0.5rem;">${course.course_code} - ${course.course_name}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">หัวข้อ: ${session.session_title}</div>
          
          <hr style="border: 0; border-top: 1px solid var(--color-chalk-dark); margin: 0.75rem 0;" />
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.5rem;">
            <div>
              <span class="text-muted">นักศึกษา:</span>
              <div class="font-semibold">${record.student_name}</div>
            </div>
            <div>
              <span class="text-muted">รหัสนักศึกษา:</span>
              <div class="font-semibold">${record.student_id}</div>
            </div>
          </div>

          <div style="font-size: 0.85rem;">
            <span class="text-muted">ตำแหน่งเช็คชื่อ (GPS Coords):</span>
            <div style="margin-top: 0.15rem;">${gpsString}</div>
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
