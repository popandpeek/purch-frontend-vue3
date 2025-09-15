/**
 * Design Token System
 * Centralized design tokens for consistent styling across the application
 */
export abstract class DesignTokens {
  // Color System
  static readonly colors = {
    primary: {
      50: '#f3e8ff',
      100: '#e9d5ff',
      200: '#d4b3ff',
      300: '#b894ff',
      400: '#9c7bff',
      500: '#3d008d',    // Main brand color
      600: '#270041',    // Dark variant
      700: '#1f0033',
      800: '#170025',
      900: '#1a0033'
    },
    neutral: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#6c757d',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#000000'
    },
    semantic: {
      success: '#28a745',
      successLight: '#d4edda',
      warning: '#ffc107',
      warningLight: '#fff3cd',
      error: '#dc3545',
      errorLight: '#f8d7da',
      info: '#17a2b8',
      infoLight: '#d1ecf1'
    },
    accent: {
      purple: '#f391e3',
      purpleLight: '#f8c4f0'
    }
  };

  // Typography System
  static readonly typography = {
    fontFamily: {
      primary: "'Roboto', sans-serif",
      display: "'Proza Libre', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem'       // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  };

  // Spacing System (based on 4px grid)
  static readonly spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem'    // 128px
  };

  // Border Radius System
  static readonly borderRadius = {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px'
  };

  // Shadow System
  static readonly shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  };

  // Z-Index System
  static readonly zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  };

  // Breakpoints for responsive design
  static readonly breakpoints = {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1400px'
  };

  // Animation durations
  static readonly duration = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  };

  // Animation easing functions
  static readonly easing = {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };
}
