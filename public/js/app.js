// School ERP System - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function(alert) {
    setTimeout(function() {
      const alertInstance = new bootstrap.Alert(alert);
      alertInstance.close();
    }, 5000);
  });

  // Add loading state to buttons on form submit
  const forms = document.querySelectorAll('form');
  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }
    });
  });

  // Confirm delete actions
  const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
  deleteButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      const message = button.dataset.confirmDelete || 'Are you sure you want to delete this item?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // Table search functionality
  const searchInputs = document.querySelectorAll('[data-table-search]');
  searchInputs.forEach(function(input) {
    const targetTable = document.querySelector(input.dataset.tableSearch);
    if (targetTable) {
      input.addEventListener('input', function() {
        const searchTerm = input.value.toLowerCase();
        const rows = targetTable.querySelectorAll('tbody tr');
        
        rows.forEach(function(row) {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
      });
    }
  });

  // Add fade-in animation to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(function(card, index) {
    card.style.animationDelay = (index * 0.1) + 's';
    card.classList.add('fade-in');
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add active class to current navigation item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function(link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Auto-resize textareas
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(function(textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  });

  // Copy to clipboard functionality
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      const textToCopy = button.dataset.copy;
      navigator.clipboard.writeText(textToCopy).then(function() {
        // Show success message
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check"></i> Copied!';
        button.classList.add('btn-success');
        
        setTimeout(function() {
          button.innerHTML = originalText;
          button.classList.remove('btn-success');
        }, 2000);
      });
    });
  });
});

// Utility functions
function showToast(message, type = 'info') {
  // Create toast element
  const toastHtml = `
    <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  // Add to toast container
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = toastContainer.lastElementChild;
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
  
  // Remove element after hiding
  toastElement.addEventListener('hidden.bs.toast', function() {
    toastElement.remove();
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Export functions for global use
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;