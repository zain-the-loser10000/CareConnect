/**
 * @file Themes.jsx
 * @module styles/Themes
 * @description Centralized, production-grade theme definitions for the application.
 * Contains core colors, custom dashboard palettes, typography specs, and shadow elevations.
 */

export const theme = {
  colors: {
    // Core brand definitions
    primary: '#007D77',
    primaryLight: '#09A6B1',
    tertiary: '#044E4B', // Added tertiary color referenced in Splash screen gradient
    secondary: '#005F5A', // Example secondary brand tone
    success: '#2F9E77',
    warning: '#F59E0B',
    error: '#FB090A',
    white: '#FFFFFF',
    dark: '#000000',
    gray: '#696969',
    border: '#E2E8F0',

    // Semantic application structural tones
    background: '#F0FAFA',
    textPrimary: '#0A1D2D',
    textMuted: '#8D8D8D',
  },

  typography: {
    // Distinct font families for headings and body
    families: {
      poppins: {
        black: 'Poppins-Black',
        bold: 'Poppins-Bold',
        light: 'Poppins-Light',
        medium: 'Poppins-Medium',
        regular: 'Poppins-Regular',
        semiBold: 'Poppins-SemiBold',
      },
    },

    // Scaled baseline font sizes
    fontSize: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 24,
      xxl: 32,
    },

    // Proportional text line heights
    lineHeight: {
      xs: 20,
      sm: 22,
      md: 26,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
  },

  // Abstract layout sizing engines
  spacing: factor => factor * 8,
  gap: factor => factor * 8,

  // Uniform layout perimeter smoothing rules
  borderRadius: {
    small: 6,
    medium: 8,
    large: 16,
    circle: 9999,
  },

  // Layered interface depth shadow systems
  elevation: {
    depth1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    depth2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    depth3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 12,
    },
  },
};
