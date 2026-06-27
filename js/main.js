/* ============================================
   FinCalc Pro - Main JavaScript Module
   ============================================ */

// Format currency with locale support
function formatCurrency(amount, currency = 'CNY') {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format number with thousands separator
function formatNumber(num, decimals = 2) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

// Format percentage
function formatPercent(num, decimals = 2) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num / 100);
}

// Parse currency string to number
function parseCurrency(str) {
  return parseFloat(str.replace(/[^\d.-]/g, '')) || 0;
}

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Validate numeric input
function validateNumber(value, min = 0, max = Infinity) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
}

// Clamp number between min and max
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Local storage helpers
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// DOM utilities
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Create element with attributes
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

// Theme handling
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  if (!toggle) return;

  // Restore saved theme or default to dark
  const savedTheme = storage.get('theme');
  if (savedTheme === 'light') {
    root.classList.add('light');
    toggle.textContent = '☀️';
    toggle.setAttribute('aria-pressed', 'true');
  }

  toggle.addEventListener('click', () => {
    root.classList.toggle('light');
    const isLight = root.classList.contains('light');
    toggle.textContent = isLight ? '☀️' : '🌙';
    toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    storage.set('theme', isLight ? 'light' : 'dark');
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: isLight ? 'light' : 'dark' } }));
  });
}

// Read a CSS custom property value
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Theme-aware chart colors
function getChartColors() {
  return {
    primary: getCSSVariable('--chart-primary') || '#8b5cf6',
    secondary: getCSSVariable('--chart-secondary') || '#a855f7',
    success: getCSSVariable('--chart-success') || '#10b981',
    warning: getCSSVariable('--chart-warning') || '#f59e0b',
    danger: getCSSVariable('--chart-danger') || '#ef4444',
    info: getCSSVariable('--chart-info') || '#3b82f6',
    grid: getCSSVariable('--chart-grid') || 'rgba(255,255,255,0.1)',
    text: getCSSVariable('--chart-text') || 'rgba(255,255,255,0.5)',
    bg: getCSSVariable('--chart-bg') || 'rgba(255,255,255,0.06)'
  };
}

// Subscribe to theme changes
function onThemeChange(callback) {
  window.addEventListener('themechange', (e) => callback(e.detail.theme));
}

// FAQ Toggle
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const question = $('.faq-question', item);
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    }
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const menuBtn = $('.mobile-menu-btn');
  const nav = $('.nav-links');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      const isOpen = nav.classList.contains('mobile-open');
      nav.style.display = isOpen ? 'flex' : '';
      menuBtn.innerHTML = isOpen ? 
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' :
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  }
}

// Chart colors
const ChartColors = {
  primary: '#f59e0b',
  secondary: '#fbbf24',
  success: '#34d399',
  warning: '#f59e0b',
  danger: '#f87171',
  muted: 'rgba(237,237,232,0.3)',
  grid: 'rgba(237,237,232,0.08)'
};

// Common page init (idempotent)
let pageInitialized = false;
function initPage() {
  if (pageInitialized) return;
  pageInitialized = true;
  initTheme();
  initFAQ();
  initMobileMenu();
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// Export utilities
window.FinanceCalc = {
  formatCurrency,
  formatNumber,
  formatPercent,
  parseCurrency,
  debounce,
  throttle,
  validateNumber,
  clamp,
  storage,
  $,
  $$,
  createElement,
  ChartColors,
  getCSSVariable,
  getChartColors,
  onThemeChange,
  initTheme,
  initFAQ,
  initMobileMenu,
  initPage
};