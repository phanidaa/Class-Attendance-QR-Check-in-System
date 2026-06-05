/*
   Class Attendance QR Check-in System - Course Management View
   Controls course lists, addition/edition modals, and deletions.
*/

const CoursesView = {
  modalController: null,
  editingCourseId: null,

  render() {
    const courses = window.db.getCourses();
    
    const content = `
      <div class="content-card mb-3">
        <div class="card-header">
          <div class="card-title">
            <h3>จัดการวิชาเรียน (Course Management)</h3>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" id="btn-add-course">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              เพิ่มรายวิชา
            </button>
          </div>
        </div>
        <p class="text-muted" style="font-size: 0.9rem;">คุณสามารถเพิ่มรายวิชาสำหรับเช็คชื่อเข้าห้องเรียน และจัดการรายชื่อนักศึกษาแต่ละรายวิชาได้ที่นี่</p>
      </div>

      <div class="items-list-grid" id="courses-list-container">
        ${courses.length === 0 ? `
          <div class="content-card text-center" style="grid-column: 1/-1; padding: 3rem;">
            <p class="text-muted mb-2">ยังไม่มีการเพิ่มรายวิชาในระบบ</p>
            <button class="btn btn-primary" onclick="CoursesView.openAddModal()" style="display: inline-flex;">เพิ่มวิชาแรกของคุณ</button>
          </div>
        ` : courses.map(c => {
          const students = window.db.getStudentsByCourse(c.id);
          const sessions = window.db.getSessionsByCourse(c.id);
          
          return `
            <div class="item-card">
              <div>
                <div class="item-card-header">
                  <span class="item-card-code">${c.course_code}</span>
                  <span class="text-muted" style="font-size: 0.8rem; font-weight: 500;">Sec ${c.section}</span>
                </div>
                <h4 class="item-card-title mb-2">${c.course_name}</h4>
                <div class="item-card-detail">
                  <div>ภาคเรียน: ${c.semester}/${c.academic_year}</div>
                  <div>อาจารย์: ${c.teacher_name}</div>
                  <div class="mt-2" style="display: flex; gap: 0.75rem; font-size: 0.8rem; font-weight: 600;">
                    <span style="color: var(--color-crimson);">${students.length} นักศึกษา</span>
                    <span style="color: var(--color-text-muted);">${sessions.length} คาบเรียน</span>
                  </div>
                </div>
              </div>
              <div class="item-card-actions">
                <button class="btn btn-secondary btn-sm" onclick="CoursesView.openEditModal('${c.id}')" title="แก้ไขวิชา">
                  <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  แก้ไข
                </button>
                <button class="btn btn-danger btn-sm" onclick="CoursesView.handleDelete('${c.id}', '${c.course_name}')" title="ลบวิชา">
                  <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Add/Edit Course Modal Overlay -->
      <div class="modal-overlay" id="course-modal">
        <div class="modal-window">
          <div class="modal-header">
            <h3 id="course-modal-title">เพิ่มรายวิชาใหม่</h3>
            <button class="modal-close">
              <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form id="course-form" onsubmit="CoursesView.handleSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label" for="c-code">รหัสวิชา</label>
                <input class="form-control" type="text" id="c-code" placeholder="เช่น EN-013-333" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="c-name">ชื่อวิชา</label>
                <input class="form-control" type="text" id="c-name" placeholder="เช่น Web Programming Lab" required />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="c-section">กลุ่มเรียน (Section)</label>
                  <input class="form-control" type="text" id="c-section" placeholder="เช่น Sec 1" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-semester">ภาคเรียน (Semester)</label>
                  <select class="form-control" id="c-semester" required>
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                    <option value="3">ภาคเรียนฤดูร้อน</option>
                  </select>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="c-year">ปีการศึกษา (Academic Year)</label>
                  <input class="form-control" type="number" id="c-year" value="${new Date().getFullYear() + 543}" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="c-teacher">อาจารย์ผู้สอน</label>
                  <input class="form-control" type="text" id="c-teacher" placeholder="ชื่อผู้สอน" required />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" data-modal-action="cancel">ยกเลิก</button>
              <button class="btn btn-primary" type="submit">บันทึกวิชา</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('app-view-content').innerHTML = content;

    // Initialize Modal
    this.modalController = window.UIComponents.initModal('course-modal');

    // Add event listener to opening button
    const addBtn = document.getElementById('btn-add-course');
    if (addBtn) addBtn.onclick = () => this.openAddModal();
  },

  openAddModal() {
    this.editingCourseId = null;
    document.getElementById('course-modal-title').innerText = 'เพิ่มรายวิชาใหม่';
    document.getElementById('course-form').reset();
    document.getElementById('c-year').value = new Date().getFullYear() + 543;
    this.modalController.open();
  },

  openEditModal(id) {
    const course = window.db.getCourseById(id);
    if (!course) return;

    this.editingCourseId = id;
    document.getElementById('course-modal-title').innerText = 'แก้ไขข้อมูลวิชา';
    
    document.getElementById('c-code').value = course.course_code;
    document.getElementById('c-name').value = course.course_name;
    document.getElementById('c-section').value = course.section;
    document.getElementById('c-semester').value = course.semester.split('/')[0];
    document.getElementById('c-year').value = course.academic_year;
    document.getElementById('c-teacher').value = course.teacher_name;

    this.modalController.open();
  },

  handleSubmit(e) {
    e.preventDefault();
    
    const courseData = {
      course_code: document.getElementById('c-code').value.trim(),
      course_name: document.getElementById('c-name').value.trim(),
      section: document.getElementById('c-section').value.trim(),
      semester: document.getElementById('c-semester').value + '/' + document.getElementById('c-year').value,
      academic_year: document.getElementById('c-year').value.trim(),
      teacher_name: document.getElementById('c-teacher').value.trim()
    };

    if (this.editingCourseId) {
      courseData.id = this.editingCourseId;
    }

    try {
      window.db.saveCourse(courseData);
      window.UIComponents.showToast(this.editingCourseId ? 'แก้ไขข้อมูลรายวิชาสำเร็จ' : 'เพิ่มรายวิชาใหม่สำเร็จ');
      this.modalController.close();
      this.render(); // refresh view
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  },

  handleDelete(id, name) {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${name}"?\nการลบจะทำให้รายชื่อนักศึกษาและประวัติการเช็คชื่อทั้งหมดถูกลบถาวร!`)) {
      window.db.deleteCourse(id);
      window.UIComponents.showToast('ลบวิชาเรียนสำเร็จแล้ว', 'error');
      this.render();
    }
  }
};

window.CoursesView = CoursesView;
