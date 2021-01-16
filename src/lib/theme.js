const colors = {
  gray10: '#F7FAFC',
  gray20: '#EDF2F7',
  gray30: '#e2e8f0',
  gray40: '#CBD5E0',
  gray60: '#384151',
  gray70: '#273043',
  gray80: '#1d2331',
  gray90: '#161b25',
  blue10: '#3291FF',
  blue20: '#0070F3',
  yellow20: '#ECC94B',
  red20: '#F56565',
};

module.exports = {
  light: {
    isDefault: true,
    scheme: {
      colors: {
        primary: colors.blue20,
        warning: colors.yellow20,
        danger: colors.red20,
      },
      backgroundColor: {
        dark: colors.gray80,
        light: colors.gray20,
        lighter: colors.gray10,
        input: 'rgba(160, 174, 192, 0.1)',
        'input-dark': 'rgba(160, 174, 192, 0.15)',
        card: 'white',
      },
      textColor: {
        default: colors.gray80,
        light: colors.gray70,
        lighter: colors.gray60,
      },
      borderColor: {
        default: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
  dark: {
    selector: '[data-theme="dark"]',
    scheme: {
      colors: {
        primary: colors.blue10,
      },
      backgroundColor: {
        dark: colors.gray90,
        light: colors.gray90,
        lighter: colors.gray80,
        input: 'rgba(160, 174, 192, 0.06)',
        'input-dark': 'rgba(160, 174, 192, 0.1)',
        card: colors.gray70,
      },
      textColor: {
        default: colors.gray10,
        light: colors.gray20,
        lighter: colors.gray40,
      },
      borderColor: {
        default: 'rgba(0, 0, 0, 0.2)',
      },
    },
  },
};
