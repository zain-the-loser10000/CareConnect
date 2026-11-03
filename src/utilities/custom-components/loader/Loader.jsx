/**
 * @file Loader.jsx
 * @module utilities/custom-components/loader/Loader
 * @description Native ActivityIndicator based loader. Wrapped to keep the same API
 * as the previous SVG loader, but removes the react-native-svg dependency.
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../../styles/Themes';

const SIZE_MAPPING = {
  small: 24,
  medium: 40,
  large: 56,
};

const Loader = ({ color, size = 'medium', scaleUtil }) => {
  // Scale utility hook fallback
  const normalize = scaleUtil || (val => val);

  // Default color fallback to primary theme color
  const spinnerColor = color || theme.colors.primary;

  // Resolve numeric size value
  const numericSize =
    typeof size === 'number' ? size : SIZE_MAPPING[size] || SIZE_MAPPING.medium;

  const actualSize = normalize(numericSize);

  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size={actualSize} color={spinnerColor} />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
