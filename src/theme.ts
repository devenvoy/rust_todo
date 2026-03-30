import { createTheme, MantineThemeOverride } from '@mantine/core';

export const precisionNoirTheme: MantineThemeOverride = createTheme({
  primaryColor: 'violet',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Manrope, sans-serif',
    fontWeight: '700',
  },
  colors: {
    // Custom charcoal palette
    dark: [
      '#e7e5e5', // on-surface
      '#b0adad',
      '#484848', // outline-variant (15% for ghost borders)
      '#2b2c2c', // surface-bright (hover states)
      '#252626', // surface-container-highest (active cards)
      '#1a1b1b',
      '#131313', // surface-container-low (sidebar)
      '#0e0e0e', // surface (base)
      '#080808',
      '#050505',
    ],
    // AI Violet
    violet: [
      '#f3ebff',
      '#e6d6ff',
      '#dab9ff', // primary
      '#cfa7ff', // primary-dim
      '#b88dff',
      '#9e66ff',
      '#8a49ff',
      '#742ef2',
      '#5f16d9',
      '#4c00bf',
    ],
    // Productive Teal
    teal: [
      '#e6f7f6',
      '#cceee1',
      '#43aea4', // secondary
      '#3a978f',
      '#2f7c75',
      '#25625c',
      '#1b4944',
      '#12312d',
      '#091816',
      '#000000',
    ],
    // Slow Amber
    amber: [
       '#fff8e1',
       '#ffecb3',
       '#ffc87f', // tertiary
       '#ffb74d',
       '#ffa726',
       '#fb8c00',
       '#f57c00',
       '#ef6c00',
       '#e65100',
       '#000000',
    ]
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: () => ({
        root: {
          transition: 'all 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        },
      }),
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        bg: 'dark.4',
      },
    },
    TextInput: {
        styles: {
            input: {
                backgroundColor: '#252626',
                border: 'none',
                '&:focus': {
                    boxShadow: '0 0 0 1px #dab9ff, 0 0 0 3px rgba(218, 185, 255, 0.2)',
                }
            }
        }
    }
  },
});
