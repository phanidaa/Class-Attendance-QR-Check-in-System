/*
   Class Attendance QR Check-in System - UI Components
   Contains reusable helper functions for Modals, Charts, and QR Code displays.
*/

const UIComponents = {
  // Toast notifications (floating message)
  showToast(message, type = 'success') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    
    // Set icon based on type
    const iconSvg = type === 'success' 
      ? `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>`;
    
    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  },

  // Modal Dialog Controllers
  initModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return null;
    
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('[data-modal-action="cancel"]');
    
    const closeFn = () => {
      modal.classList.remove('active');
      if (options.onClose) options.onClose();
    };
    
    if (closeBtn) closeBtn.onclick = closeFn;
    if (cancelBtn) cancelBtn.onclick = closeFn;
    
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) closeFn();
    };
    
    return {
      open() {
        modal.classList.add('active');
        if (options.onOpen) options.onOpen();
      },
      close() {
        closeFn();
      }
    };
  },

  // Premium QR Code generator using qrcode.js library
  generateQRCode(containerId, dataString) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous QR
    container.innerHTML = '';
    
    try {
      if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
          text: dataString,
          width: 200,
          height: 200,
          colorDark: "#2c5ead", // Premium Deep Blue accent color
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // Fallback using high-quality third-party api if library fails to load
        const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2c5ead&data=${encodeURIComponent(dataString)}`;
        container.innerHTML = `<img src="${fallbackUrl}" alt="Check-in QR Code" />`;
      }
    } catch (e) {
      console.error('QR Code error, using API fallback:', e);
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=2c5ead&data=${encodeURIComponent(dataString)}`;
      container.innerHTML = `<img src="${fallbackUrl}" alt="Check-in QR Code" />`;
    }
  },

  // Premium Custom styling wrapper for Chart.js
  renderDoughnutChart(canvasId, labels, dataValues, chartTitle = 'Attendance Status') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    // Check if chart instance exists, destroy it to re-render
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    
    const ctx = canvas.getContext('2d');
    
    // Colors configured for our Chalk and Crimson design system
    const colors = [
      '#2d6a4f', // Present (Deep Green)
      '#d97706', // Late (Amber)
      '#dc143c', // Absent (Crimson)
      '#2563eb'  // Excused (Blue)
    ];

    const lightColors = [
      'rgba(45, 106, 79, 0.85)',
      'rgba(217, 119, 6, 0.85)',
      'rgba(220, 20, 60, 0.85)',
      'rgba(37, 99, 235, 0.85)'
    ];

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: lightColors,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBackgroundColor: colors,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: '500'
              },
              color: '#2b2b2b',
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#2b2b2b',
            titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
            bodyFont: { family: 'Plus Jakarta Sans' },
            padding: 10,
            cornerRadius: 8,
            boxWidth: 8,
            boxHeight: 8,
            boxPadding: 4,
            usePointStyle: true
          }
        },
        cutout: '72%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  },

  renderBarChart(canvasId, labels, dataValues, datasetLabel = 'Attendance Rate (%)') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
    
    const ctx = canvas.getContext('2d');
    
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: dataValues,
          backgroundColor: 'rgba(44, 94, 173, 0.75)', // Deep Blue transparent
          borderColor: '#2c5ead',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#2c5ead'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#2b2b2b',
            titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
            bodyFont: { family: 'Plus Jakarta Sans' },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              },
              color: '#64748b'
            }
          },
          y: {
            grid: {
              color: '#f1f1f1'
            },
            ticks: {
              beginAtZero: true,
              max: 100,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              },
              color: '#64748b'
            }
          }
        }
      }
    });
  }
};

window.UIComponents = UIComponents;
