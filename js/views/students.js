/*
   Class Attendance QR Check-in System - Student Management View
   Controls student list views by course, addition/edition modals, and CSV parsing helpers.
*/

const StudentsView = {
  studentModal: null,
  csvModal: null,
  editingStudentId: null,
  selectedCourseId: null,

  render() {
    const courses = window.db.getCourses();
    
    // Choose active course filter
    if (courses.length > 0 && !this.selectedCourseId) {
      this.selectedCourseId = courses[0].id;
    }

    const enrolledStudents = this.selectedCourseId ? window.db.getStudentsByCourse(this.selectedCourseId) : [];
    const activeCourse = courses.find(c => c.id === this.selectedCourseId);

    const content = `
      <div class="content-card mb-3">
        <div class="card-header">
          <div class="card-title">
            <h3>รายชื่อนักศึกษา (Student Management)</h3>
          </div>
          <div class="card-actions" style="gap: 0.5rem; flex-wrap: wrap;">
            ${this.selectedCourseId ? `
              <button class="btn btn-secondary btn-sm" id="btn-import-csv">
                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                นำเข้าจากไฟล์ CSV
              </button>
              <button class="btn btn-primary btn-sm" id="btn-add-student">
                <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235A8.91 8.91 0 0111 18c2.046 0 3.93.682 5.437 1.832" /></svg>
                เพิ่มนักศึกษาใหม่
              </button>
            ` : ''}
          </div>
        </div>
        
        <div class="filter-row mt-2">
          <div class="filter-item" style="flex: 2;">
            <label class="form-label" style="font-weight: 700;">กรองตามรายวิชาที่เลือก</label>
            <select class="form-control" id="student-course-select" onchange="StudentsView.handleCourseFilter(this.value)">
              ${courses.map(c => `
                <option value="${c.id}" ${c.id === this.selectedCourseId ? 'selected' : ''}>
                  ${c.course_code} - ${c.course_name} (Sec ${c.section})
                </option>
              `).join('')}
              ${courses.length === 0 ? '<option value="">-- ยังไม่มีข้อมูลวิชาเรียน --</option>' : ''}
            </select>
          </div>
          ${activeCourse ? `
            <div class="filter-item" style="flex: 1; min-width: 150px; display: flex; flex-direction: column; justify-content: flex-end;">
              <span class="text-muted" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem;">ยอดลงทะเบียนเรียน</span>
              <div style="background-color: var(--color-chalk); border: 1px solid var(--color-chalk-dark); padding: 0.6rem 1rem; border-radius: var(--radius-md); font-weight: 700; font-size: 0.95rem; text-align: center; color: var(--color-crimson);">
                ${enrolledStudents.length} / ${activeCourse.max_students || 40} คน
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="content-card">
        <div class="table-responsive">
          <table class="custom-table" id="students-table">
            <thead>
              <tr>
                <th style="width: 80px;">ลำดับ</th>
                <th>รหัสนักศึกษา</th>
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>วันที่ลงทะเบียน</th>
                <th style="text-align: right;">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${!this.selectedCourseId ? `
                <tr>
                  <td colspan="6" class="text-center text-muted" style="padding: 2rem;">กรุณาสร้างรายวิชาก่อนจัดการรายชื่อนักศึกษา</td>
                </tr>
              ` : enrolledStudents.length === 0 ? `
                <tr>
                  <td colspan="6" class="text-center text-muted" style="padding: 3rem;">
                    <div>ยังไม่มีรายชื่อนักศึกษาในวิชานี้</div>
                    <div class="mt-2" style="display: flex; gap: 0.5rem; justify-content: center;">
                      <button class="btn btn-primary btn-sm" onclick="StudentsView.openAddModal()">เพิ่มคนแรก</button>
                      <button class="btn btn-secondary btn-sm" onclick="StudentsView.openCsvModal()">นำเข้าด้วยไฟล์ CSV</button>
                    </div>
                  </td>
                </tr>
              ` : enrolledStudents.map((s, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="font-semibold">${s.student_id}</td>
                  <td>${s.full_name}</td>
                  <td><span class="text-muted">${s.email || '-'}</span></td>
                  <td><span class="text-muted" style="font-size: 0.8rem;">${new Date(s.created_at).toLocaleDateString('th-TH')}</span></td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem;" onclick="StudentsView.openEditModal('${s.id}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button class="btn btn-danger btn-sm" style="padding: 0.3rem 0.6rem;" onclick="StudentsView.handleDelete('${s.id}', '${s.full_name}')">
                        <svg viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Student Modal -->
      <div class="modal-overlay" id="student-modal">
        <div class="modal-window">
          <div class="modal-header">
            <h3 id="student-modal-title">เพิ่มนักศึกษาใหม่</h3>
            <button class="modal-close">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form id="student-form" onsubmit="StudentsView.handleSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="s-id">รหัสนักศึกษา (Student ID)</label>
                <input class="form-control" type="text" id="s-id" placeholder="เช่น 66010021" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="s-name">ชื่อ-นามสกุล</label>
                <input class="form-control" type="text" id="s-name" placeholder="เช่น นายสมชาย ใจดี" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="s-email">อีเมล (Email) - ไม่บังคับ</label>
                <input class="form-control" type="email" id="s-email" placeholder="เช่น student@university.edu" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" data-modal-action="cancel">ยกเลิก</button>
              <button class="btn btn-primary" type="submit">บันทึก</button>
            </div>
          </form>
        </div>
      </div>

      <!-- CSV Import Modal -->
      <div class="modal-overlay" id="csv-modal">
        <div class="modal-window">
          <div class="modal-header">
            <h3>นำเข้าข้อมูลรายชื่อนักศึกษา (CSV/Text)</h3>
            <button class="modal-close">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form id="csv-form" onsubmit="StudentsView.handleCsvSubmit(event)">
            <div class="modal-body">
              <p class="text-muted mb-2" style="font-size: 0.85rem;">วางข้อมูลรายชื่อนักศึกษาลงในกล่องด้านล่าง (คั่นรหัส ชื่อ และอีเมลด้วยเครื่องหมาย คอมมา (,) หรือ แท็บ (Tab))</p>
              <div class="form-group">
                <label class="form-label" for="csv-text-area">ข้อมูลรายชื่อนักศึกษา</label>
                <textarea class="form-control" id="csv-text-area" rows="10" placeholder="รหัสนักศึกษา,ชื่อ-นามสกุล,อีเมล&#10;66010099,สมศักดิ์ แสนสบาย,somsak@mail.com&#10;66010088,กิตติพงษ์ ยอดเยี่ยม,kittipong@mail.com" required style="font-family: monospace; font-size: 0.85rem; resize: vertical;"></textarea>
              </div>
              <div id="csv-info-msg" class="text-muted" style="font-size: 0.8rem;">
                * ระบบจะละเว้นแถวแรกที่เป็นหัวตารางให้อัตโนมัติหากมี
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" data-modal-action="cancel">ยกเลิก</button>
              <button class="btn btn-primary" type="submit">นำเข้าทันที</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;

    // Initialize modals
    this.studentModal = window.UIComponents.initModal('student-modal');
    this.csvModal = window.UIComponents.initModal('csv-modal');

    // Wire up events
    const addBtn = document.getElementById('btn-add-student');
    if (addBtn) addBtn.onclick = () => this.openAddModal();

    const importBtn = document.getElementById('btn-import-csv');
    if (importBtn) importBtn.onclick = () => this.openCsvModal();
  },

  handleCourseFilter(val) {
    this.selectedCourseId = val;
    this.render();
  },

  openAddModal() {
    this.editingStudentId = null;
    document.getElementById('student-modal-title').innerText = 'เพิ่มนักศึกษาใหม่';
    document.getElementById('student-form').reset();
    document.getElementById('s-id').disabled = false;
    this.studentModal.open();
  },

  openEditModal(id) {
    const s = window.db.getStudentById(id);
    if (!s) return;

    this.editingStudentId = id;
    document.getElementById('student-modal-title').innerText = 'แก้ไขข้อมูลนักศึกษา';
    document.getElementById('s-id').value = s.student_id;
    document.getElementById('s-id').disabled = true; // prevent changing primary ID
    document.getElementById('s-name').value = s.full_name;
    document.getElementById('s-email').value = s.email || '';

    this.studentModal.open();
  },

  openCsvModal() {
    document.getElementById('csv-form').reset();
    this.csvModal.open();
  },

  handleSubmit(e) {
    e.preventDefault();
    
    const studentData = {
      student_id: document.getElementById('s-id').value.trim(),
      full_name: document.getElementById('s-name').value.trim(),
      email: document.getElementById('s-email').value.trim(),
      course_id: this.selectedCourseId
    };

    if (this.editingStudentId) {
      studentData.id = this.editingStudentId;
    }

    try {
      window.db.saveStudent(studentData);
      window.UIComponents.showToast(this.editingStudentId ? 'แก้ไขข้อมูลนักศึกษาสำเร็จ' : 'เพิ่มนักศึกษาใหม่สำเร็จ');
      this.studentModal.close();
      this.render();
    } catch (err) {
      alert('ไม่สามารถบันทึกข้อมูลได้: ' + err.message);
    }
  },

  handleCsvSubmit(e) {
    e.preventDefault();
    const text = document.getElementById('csv-text-area').value;
    
    const result = window.db.importStudentsFromCSV(this.selectedCourseId, text);
    
    if (result.success > 0) {
      window.UIComponents.showToast(`นำเข้าสำเร็จ ${result.success} คน!`);
      this.csvModal.close();
      this.render();
    }
    
    if (result.errors.length > 0) {
      alert(`มีข้อผิดพลาดบางประการในการนำเข้าข้อมูล:\n\n${result.errors.slice(0, 10).join('\n')}${result.errors.length > 10 ? '\n...และอื่นๆ' : ''}`);
    }
  },

  handleDelete(id, name) {
    if (confirm(`คุณต้องการลบรายชื่อนักศึกษา "${name}" ออกจากรายวิชานี้ใช่หรือไม่?\n(ประวัติการเข้าเรียนทั้งหมดของนักศึกษาคนนี้จะถูกลบออกด้วย)`)) {
      window.db.deleteStudent(id);
      window.UIComponents.showToast('ลบข้อมูลนักศึกษาสำเร็จแล้ว', 'error');
      this.render();
    }
  }
};

window.StudentsView = StudentsView;
