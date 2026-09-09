import { createTheme, MantineColorsTuple } from '@mantine/core';

// We can define custom color tuples if we need exact matches, 
// but using the one closest to #6366F1 (Indigo) is usually preferred, 
// or we can generate it.
const primaryAccent: MantineColorsTuple = [
  '#eef1fd',
  '#dbe1f8',
  '#b5c1f0',
  '#8ea0e8',
  '#6f83e2',
  '#5a70df',
  '#4e65de',
  '#3f54c5',
  '#374bb0',
  '#2d419b'
];

export const theme = createTheme({
  primaryColor: 'primary-accent',
  colors: {
    'primary-accent': primaryAccent,
  },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    sizes: {
      h1: { fontSize: '32px', lineHeight: '1.3', fontWeight: '700' },
      h2: { fontSize: '24px', lineHeight: '1.4', fontWeight: '700' },
      h3: { fontSize: '20px', lineHeight: '1.4', fontWeight: '700' },
    },
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
