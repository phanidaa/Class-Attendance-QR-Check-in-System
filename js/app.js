/*
   Class Attendance QR Check-in System - Main App Entry
   Handles SPA router logic, navigation listeners, page transitions, role toggling, and URL query scanning.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Dark Theme support
  window.toggleDarkMode = () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('dark_mode_enabled', isDark ? 'true' : 'false');
    window.UIComponents.showToast(isDark ? 'เปิดใช้งานโหมดมืด (Dark Mode)' : 'เปิดใช้งานโหมดสว่าง (Light Mode)');
  };

  // Check saved theme preferences
  if (localStorage.getItem('dark_mode_enabled') === 'true') {
    document.body.classList.add('dark-theme');
  }

  // Global Application State
  const AppState = {
    currentRole: 'teacher', // 'teacher' or 'student'
    currentPage: 'dashboard' // active view in teacher console
  };

  // Modern Routing controller
  window.appRouter = (targetPage, bypassRoleCheck = false) => {
    // 1. If switching to student role (Check-in view)
    if (targetPage === 'checkin') {
      AppState.currentRole = 'student';
      AppState.currentPage = 'checkin';
      
      // Update UI panels visibility
      document.getElementById('app-sidebar').classList.add('d-none');
      document.getElementById('app-main-wrapper').style.marginLeft = '0';
      document.getElementById('app-main-header').classList.add('d-none');
      
      // Update toggle button text
      document.getElementById('btn-role-toggle').innerText = '🔑 เข้าสู่ระบบอาจารย์ (Teacher)';
      
      // Render Student Check-in View
      // Parse query string for prefilled session code
      const urlParams = new URLSearchParams(window.location.search);
      const prefilledCode = urlParams.get('session') || '';
      window.CheckinView.render(prefilledCode);
      return;
    }

    // 2. Switching to teacher console
    if (AppState.currentRole === 'student' && !bypassRoleCheck) {
      // Switched role from Student back to Teacher
      AppState.currentRole = 'teacher';
      document.getElementById('app-sidebar').classList.remove('d-none');
      
      // Recalculate margins based on viewport width
      if (window.innerWidth > 768) {
        document.getElementById('app-main-wrapper').style.marginLeft = 'var(--sidebar-width)';
      } else {
        document.getElementById('app-main-wrapper').style.marginLeft = '0';
      }
      document.getElementById('app-main-header').classList.remove('d-none');
      document.getElementById('btn-role-toggle').innerText = '🎓 สลับเป็นโหมดนักศึกษา';
    }

    // Set page state
    AppState.currentPage = targetPage;

    // Render corresponding Teacher View
    let pageTitle = 'Dashboard';
    
    if (targetPage === 'dashboard') {
      window.DashboardView.render();
      pageTitle = 'Dashboard - ภาพรวมระบบ';
    } else if (targetPage === 'courses') {
      window.CoursesView.render();
      pageTitle = 'จัดการวิชาเรียน (Courses)';
    } else if (targetPage === 'students') {
      window.StudentsView.render();
      pageTitle = 'จัดการนักศึกษา (Students)';
    } else if (targetPage === 'sessions') {
      window.SessionsView.render();
      pageTitle = 'รอบเช็คชื่อเข้าเรียน (Sessions)';
    } else if (targetPage === 'reports') {
      window.ReportsView.render();
      pageTitle = 'รายงานการเข้าเรียน (Reports)';
    }

    // Update Header Page Title
    document.getElementById('header-page-title').innerText = pageTitle;

    // Update Sidebar visual links state active
    const menuLinks = document.querySelectorAll('.nav-link');
    menuLinks.forEach(link => {
      const pageId = link.getAttribute('data-target-page');
      if (pageId === targetPage) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });

    // Auto-close sidebar on mobile after selecting a menu item
    if (window.innerWidth <= 768) {
      document.getElementById('app-sidebar').classList.remove('show');
      document.getElementById('app-sidebar-backdrop').classList.remove('show');
    }
  };

  // Toggling role wrapper (Teacher vs Student views)
  window.toggleUserRole = () => {
    if (AppState.currentRole === 'teacher') {
      window.appRouter('checkin');
    } else {
      window.appRouter('dashboard', true);
    }
  };

  // Wire up sidebar links
  const sidebarLinks = document.querySelectorAll('.nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target-page');
      window.appRouter(target);
    });
  });

  // Mobile navigation collapsible sidebar toggler
  const mobileToggleBtn = document.getElementById('btn-mobile-menu');
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      document.getElementById('app-sidebar').classList.add('show');
      document.getElementById('app-sidebar-backdrop').classList.add('show');
    });
  }

  // Close mobile sidebar click-out
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('app-sidebar');
    const mobileBtn = document.getElementById('btn-mobile-menu');
    const backdrop = document.getElementById('app-sidebar-backdrop');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        !mobileBtn.contains(e.target)) {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    }
  });

  // Check URL parameters for direct student checkin redirections
  const urlParams = new URLSearchParams(window.location.search);
  const directSessionCode = urlParams.get('session');
  
  if (directSessionCode) {
    console.log(`Detected direct QR parameter code: "${directSessionCode}", redirecting to student screen.`);
    window.appRouter('checkin');
  } else {
    // Default load dashboard
    window.appRouter('dashboard');
  }

  // Sync viewport changes
  window.addEventListener('resize', () => {
    if (AppState.currentRole === 'teacher') {
      if (window.innerWidth > 768) {
        document.getElementById('app-main-wrapper').style.marginLeft = 'var(--sidebar-width)';
      } else {
        document.getElementById('app-main-wrapper').style.marginLeft = '0';
      }
    }
  });

  console.log('App initialized and router loaded!');
});
