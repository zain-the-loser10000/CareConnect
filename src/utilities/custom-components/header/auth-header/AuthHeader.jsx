/**
 * @file AuthHeader.jsx
 * @module utilities/custom-components/header/auth-header/AuthHeader
 * @description Animated, responsive header for authentication screens.
 * The logo circle enters with a soft spring, then beats like a heart while pulse
 * rings radiate outward (same visual language as the splash screen).
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../../../styles/Themes';
import { useGlobalStyles } from '../../../../styles/GlobalStyles';

// Logo entrance with a small overshoot
const logoEntry = {
  0: { opacity: 0, scale: 0.5, translateY: 24 },
  0.65: { opacity: 1, scale: 1.06, translateY: -3 },
  1: { opacity: 1, scale: 1, translateY: 0 },
};

// Lub-dub heartbeat: two quick beats, then rest
const heartbeat = {
  0: { scale: 1 },
  0.07: { scale: 1.06 },
  0.14: { scale: 1 },
  0.21: { scale: 1.04 },
  0.3: { scale: 1 },
  1: { scale: 1 },
};

// Ring that grows and fades
const ringPulse = {
  0: { scale: 1, opacity: 0.5 },
  1: { scale: 1.75, opacity: 0 },
};

// Very slow drift for the background glows
const drift = {
  0: { translateX: 0, translateY: 0 },
  0.5: { translateX: -10, translateY: 16 },
  1: { translateX: 0, translateY: 0 },
};

const AuthHeader = ({
  logo,
  title = 'Welcome back',
  subtitle = 'Sign in to continue',
}) => {
  const responsiveValues = useGlobalStyles();
  const styles = createStyles(responsiveValues);

  return (
    <View style={styles.container}>
      {/* Drifting background glows */}
      <Animatable.View
        animation={drift}
        iterationCount="infinite"
        duration={9000}
        easing="ease-in-out"
        useNativeDriver
        style={styles.glowTop}
        pointerEvents="none"
      />
      <Animatable.View
        animation={drift}
        iterationCount="infinite"
        duration={11000}
        delay={1500}
        easing="ease-in-out"
        useNativeDriver
        style={styles.glowSide}
        pointerEvents="none"
      />

      {/* Logo + pulse rings */}
      <View style={styles.logoArea}>
        {[1000, 2300].map(delay => (
          <Animatable.View
            key={delay}
            animation={ringPulse}
            iterationCount="infinite"
            duration={2600}
            delay={delay}
            easing="ease-out"
            useNativeDriver
            style={styles.ring}
          />
        ))}

        <Animatable.View
          animation={logoEntry}
          duration={900}
          delay={100}
          useNativeDriver
        >
          <Animatable.View
            animation={heartbeat}
            iterationCount="infinite"
            duration={2600}
            delay={1000}
            useNativeDriver
            style={styles.logoCircle}
          >
            <Image
              source={logo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animatable.View>
        </Animatable.View>
      </View>

      {/* Copy */}
      <Animatable.Text
        animation="fadeInUp"
        duration={700}
        delay={450}
        useNativeDriver
        style={styles.title}
      >
        {title}
      </Animatable.Text>

      {!!subtitle && (
        <Animatable.Text
          animation="fadeInUp"
          duration={700}
          delay={600}
          useNativeDriver
          style={styles.subtitle}
        >
          {subtitle}
        </Animatable.Text>
      )}
    </View>
  );
};

export default AuthHeader;

const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  // One value for width AND height, so the shape is a true circle.
  // (Width and height must be equal: borderRadius alone cannot make a circle.)
  const logoSize = isLandscape ? hp(28) : wp(32);

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: hp(isLandscape ? 4 : 8),
      paddingBottom: hp(isLandscape ? 3 : 5.5),
      paddingHorizontal: wp(8),
    },

    glowTop: {
      position: 'absolute',
      top: -hp(14),
      right: -wp(25),
      width: wp(90),
      height: wp(90),
      borderRadius: theme.borderRadius.circle,
      backgroundColor: theme.colors.primaryLight + '2E',
    },

    glowSide: {
      position: 'absolute',
      top: hp(6),
      left: -wp(35),
      width: wp(70),
      height: wp(70),
      borderRadius: theme.borderRadius.circle,
      backgroundColor: theme.colors.white + '0F',
    },

    logoArea: {
      width: logoSize,
      height: logoSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(4),
    },

    ring: {
      position: 'absolute',
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      borderWidth: 1,
      borderColor: theme.colors.white + 'B3',
    },

    // White circle keeps the dark-blue "Care" lettering readable on teal
    logoCircle: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...theme.elevation.depth3,
      shadowColor: theme.colors.dark,
    },

    // 72% keeps the logo inside the circle's inscribed square (no clipped corners)
    logoImage: {
      width: '72%',
      height: '72%',
    },

    title: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(30),
      color: theme.colors.white,
      letterSpacing: -0.3,
      textAlign: 'center',
    },

    subtitle: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(21),
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
    },
  });
};
