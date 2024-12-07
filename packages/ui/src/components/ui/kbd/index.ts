import { cva, VariantProps } from 'class-variance-authority';

export { default as Kbd } from './Kbd.vue';

export const kbdVariants = cva(
  'rounded px-1 text-xs leading-5 shadow font-sans min-w-5',
  {
    variants: {
      variant: {
        default: 'bg-secondary border',
        'primary-top': 'bg-black/15 border border-black/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type KbdVariants = VariantProps<typeof kbdVariants>;
