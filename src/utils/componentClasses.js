/* eslint-disable */
export const buttonUi = {
  bgColors: {
    default: 'bg-input',
    primary: 'bg-primary',
    danger: 'bg-danger',
    dark: 'bg-dark',
  },
  variants: {
    primary: {
      default: 'hover:bg-opacity-90 text-white focus:bg-opacity-90',
      flat: 'focus:bg-primary hover:bg-opacity-100 focus:bg-opacity-100 focus:text-white hover:text-white text-primary hover:bg-primary',
    },
    default: {
      default: 'hover:bg-input-dark focus:bg-input-dark',
      flat: 'focus:bg-input-dark hover:bg-input-dark',
    },
    danger: {
      default: 'hover:bg-opacity-90 text-white focus:bg-opacity-90',
      flat: 'focus:bg-danger hover:bg-opacity-100 focus:bg-opacity-100 focus:text-white hover:text-white text-danger hover:bg-danger',
    },
    dark: {
      default: 'hover:bg-opacity-90 text-white focus:bg-opacity-90',
      flat: 'focus:bg-dark hover:bg-opacity-100 focus:bg-opacity-100 focus:text-white hover:text-white text-dark hover:bg-dark',
    },
  },
  size: {
    small: {
      default: 'px-3 py-1',
      icon: 'p-1',
    },
    normal: {
      default: 'px-5 py-2',
      icon: 'p-2',
    },
    large: {
      default: 'px-8 py-2',
      icon: 'p-3',
    },
    xLarge: {
      default: 'px-12 py-4',
      icon: 'p-4',
    },
  },
};
