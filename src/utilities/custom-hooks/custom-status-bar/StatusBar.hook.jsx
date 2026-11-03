/**
 * @file StatusBar.hook.jsx
 * @module utilities/custom-hooks/custom-status-bar/StatusBar
 * @description Hook to configure the system status bar appearance and behavior for both iOS and Android safely.
 */

import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

/**
 * Hook to configure the system StatusBar settings safely.
 */
export const useStatusBarConfig = (
  barStyle = 'light-content',
  backgroundColor = 'transparent',
  translucent = true,
) => {
  useEffect(() => {
    if (typeof StatusBar.setBarStyle === 'function') {
      StatusBar.setBarStyle(barStyle);
    }

    if (Platform.OS === 'android') {
      if (typeof StatusBar.setBackgroundColor === 'function') {
        StatusBar.setBackgroundColor(backgroundColor);
      }
      if (typeof StatusBar.setTranslucent === 'function') {
        StatusBar.setTranslucent(translucent);
      }
    }
  }, [barStyle, backgroundColor, translucent]);
};
