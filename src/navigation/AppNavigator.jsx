/**
 * @file AppNavigator.jsx
 * @module navigation/AppNavigator
 * @description Configures the application's native stack navigator and shared
 * status bar behavior for the splash and onboarding screens.
 */

import React, { useState } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';
import Splash from '../screens/splash-screen/Splash';
import OnBoarding from '../screens/onboarding-screen/OnBoarding';
import Signin from '../screens/auth-screen/Signin';
import Signup from '../screens/auth-screen/Signup';
import BottomNavigator from '../navigation/bottom-navigator/BottomNavigator';

const Stack = createNativeStackNavigator();

// Temporary fallback for routes that do not yet have dedicated screens.
const Placeholder = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18 }}>{route.name} (Coming soon)</Text>
  </View>
);

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="light-content"
        translucent={false}
      />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Register screens used by the session-check flow and onboarding journey. */}
        <Stack.Screen name="OnBoarding" component={OnBoarding} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Main" component={BottomNavigator} />
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
