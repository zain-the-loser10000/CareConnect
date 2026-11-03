/**
 * @file Splash.jsx
 * @module screens/splash-screen/Splash
 * @description Branded CareConnect splash screen with a subtle, healthcare-inspired animation.
 * The logo pulses with a gentle heartbeat as soft rings radiate outward.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

// Animates the logo card into view, then settles it into its resting position.
const logoEntry = {
  0: { opacity: 0, scale: 0.6, translateY: 30 },
  0.7: { opacity: 1, scale: 1.04, translateY: -4 },
  1: { opacity: 1, scale: 1, translateY: 0 },
};

// Creates a gentle two-beat scale animation for the logo.
const heartbeat = {
  0: { scale: 1 },
  0.12: { scale: 1.07 },
  0.24: { scale: 1 },
  0.36: { scale: 1.05 },
  0.5: { scale: 1 },
  1: { scale: 1 },
};

// Expands and fades each decorative pulse ring.
const ring = {
  0: { scale: 0.7, opacity: 0.45 },
  1: { scale: 2.1, opacity: 0 },
};

const Splash = () => {
  useStatusBarConfig('light-content', 'transparent', true);

  const responsiveValues = useGlobalStyles();
  const styles = createStyles(responsiveValues);

  return (
    <View style={styles.container}>
      {/* Full-screen branded gradient background. */}
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.tertiary,
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Adds a subtle ambient highlight at the top of the screen. */}
      <Animatable.View
        animation="fadeIn"
        duration={2000}
        style={styles.topLight}
        pointerEvents="none"
      />

      {/* Centers the logo and its staggered, repeating pulse rings. */}
      <View style={styles.center}>
        <View style={styles.pulseArea}>
          {[0, 800, 1600].map(delay => (
            <Animatable.View
              key={delay}
              animation={ring}
              iterationCount="infinite"
              duration={2400}
              delay={delay + 900}
              easing="ease-out"
              useNativeDriver
              style={styles.ring}
            />
          ))}

          <Animatable.View
            animation={logoEntry}
            duration={900}
            delay={150}
            useNativeDriver
          >
            <Animatable.View
              animation={heartbeat}
              iterationCount="infinite"
              duration={1800}
              delay={1100}
              useNativeDriver
              style={styles.logoCard}
            >
              <Animatable.Image
                source={require('../../assets/logo/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animatable.View>
          </Animatable.View>
        </View>

        {/* Introductory copy, revealed in sequence. */}
        <Animatable.Text
          animation="fadeInUp"
          duration={800}
          delay={1000}
          style={styles.headline}
        >
          Your health, in one place.
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          duration={800}
          delay={1250}
          style={styles.subline}
        >
          Book doctors, keep your records and get care guidance whenever you
          need it.
        </Animatable.Text>
      </View>
    </View>
  );
};

export default Splash;

const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  const logoSize = isLandscape ? hp(34) : wp(36);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.tertiary,
    },

    topLight: {
      position: 'absolute',
      top: -hp(18),
      alignSelf: 'center',
      width: wp(130),
      height: wp(130),
      borderRadius: theme.borderRadius.circle,
      backgroundColor: theme.colors.primaryLight + '26',
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp(10),
    },

    pulseArea: {
      width: logoSize * 2.2,
      height: logoSize * 2.2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(3),
    },

    ring: {
      position: 'absolute',
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      borderWidth: 1.5,
      borderColor: theme.colors.white + 'B3',
    },

    // The white circular backing preserves contrast for the logo artwork.
    logoCard: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoSize / 2,
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.depth3,
      shadowColor: theme.colors.dark,
    },

    logoImage: {
      width: logoSize * 0.72,
      height: logoSize * 0.72,
    },

    headline: {
      fontFamily: theme.typography.families.poppins.semiBold,
      color: theme.colors.white,
      fontSize: moderateScale(22),
      lineHeight: moderateScale(34),
      textAlign: 'center',
      letterSpacing: 0.2,
    },

    subline: {
      fontFamily: theme.typography.families.poppins.regular,
      color: theme.colors.textMuted,
      fontSize: moderateScale(14),
      lineHeight: moderateScale(21),
      textAlign: 'center',
      marginTop: hp(1.5),
      maxWidth: isLandscape ? wp(50) : wp(78),
    },

    footer: {
      alignItems: 'center',
      paddingBottom: hp(isLandscape ? 4 : 6),
      gap: hp(2),
    },

    track: {
      width: wp(isLandscape ? 24 : 42),
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.2)',
      overflow: 'hidden',
    },

    bar: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: theme.colors.white,
    },

    poweredRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      opacity: 0.85,
    },
  });
};
