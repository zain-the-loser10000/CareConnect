/**
 * @file RootNavigator.jsx
 * @module navigation/RootNavigator
 * @description Root app navigation stack and status bar configuration.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;