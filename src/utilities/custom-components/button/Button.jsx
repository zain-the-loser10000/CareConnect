/**
 * @file Button.jsx
 * @module utilities/custom-components/button/Button
 * @description Animated, theme-consistent button with solid or gradient background,
 * icons, loading state and theme elevations.
 *
 * Animations:
 *  - Press: spring scale-down and release, plus Android ripple
 *  - Icon nudges in its direction while pressed
 *  - Disabled -> enabled: colour / gradient fades in and the button gives one small pop
 *  - Enabled idle: a soft light sweep passes across the button every few seconds
 *  - Tapping a disabled button shakes it ("not ready yet")
 *  - Loading: label and loader swap with a zoom / fade
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';
import Loader from '../loader/Loader';

// Fixed height in dp (not scaled, so it stays compact on large screens)
const BUTTON_HEIGHT = 44;

const Button = ({
  onPress,
  title,
  loading = false,
  style,
  textStyle,
  width,
  disabled = false,
  backgroundColor,
  gradientColors,
  textColor,
  iconName,
  iconSize = 20,
  iconColor,
  iconStyle,
  iconPosition = 'left',
  elevation,
  gradientProps = {},
}) => {
  const { scale } = useGlobalStyles();

  const isGradient =
    !backgroundColor &&
    Array.isArray(gradientColors) &&
    gradientColors.length >= 2;

  const solidColor = backgroundColor || theme.colors.primary;
  const glowColor = isGradient
    ? gradientColors[gradientColors.length - 1]
    : solidColor;
  const inactiveTint = theme.colors.primary + '59';

  const finalTextColor = textColor || theme.colors.white;
  const finalIconColor = iconColor || finalTextColor;
  const radius = theme.borderRadius.large;
  const fontFamily =
    theme.typography.semiBold || theme.typography.families.poppins.semiBold;

  const [btnWidth, setBtnWidth] = useState(0);

  // JS-driven (colours / opacity)
  const enableAnim = useRef(new Animated.Value(disabled ? 0 : 1)).current;
  // Native-driven (transforms)
  const pressScale = useRef(new Animated.Value(1)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const iconShift = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(0)).current;
  const prevDisabled = useRef(disabled);

  // Disabled <-> enabled transition
  useEffect(() => {
    Animated.timing(enableAnim, {
      toValue: disabled ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    if (prevDisabled.current && !disabled) {
      Animated.sequence([
        Animated.timing(popScale, {
          toValue: 1.05,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(popScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevDisabled.current = disabled;
  }, [disabled, enableAnim, popScale]);

  // Idle light sweep (only while the button is usable)
  const shimmerWidth = btnWidth * 0.4;
  const showShimmer = !disabled && !loading && btnWidth > 0;

  useEffect(() => {
    if (!showShimmer) return undefined;

    shimmerX.setValue(-shimmerWidth);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shimmerX, {
          toValue: btnWidth,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(2600),
        Animated.timing(shimmerX, {
          toValue: -shimmerWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [showShimmer, btnWidth, shimmerWidth, shimmerX]);

  const shake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(pressScale, {
      toValue: 0.96,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
    Animated.spring(iconShift, {
      toValue: iconPosition === 'right' ? 5 : -3,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 24,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
    Animated.spring(iconShift, {
      toValue: 0,
      speed: 24,
      bounciness: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (loading) return;
    if (disabled) {
      shake();
      return;
    }
    if (onPress) onPress();
  };

  // Interpolations
  const baseBg = enableAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveTint, isGradient ? inactiveTint : solidColor],
  });

  const shakeTranslate = shakeX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-6, 6],
  });

  const shadow =
    elevation && !disabled
      ? { ...theme.elevation[elevation], shadowColor: glowColor }
      : {};

  const renderIcon = () =>
    iconName ? (
      <Animated.View
        style={[styles.iconBase, { transform: [{ translateX: iconShift }] }]}
      >
        <Ionicons
          name={iconName}
          size={scale(iconSize)}
          color={finalIconColor}
          style={iconStyle}
        />
      </Animated.View>
    ) : null;

  const content = loading ? (
    <Animatable.View
      key="loading"
      animation="zoomIn"
      duration={220}
      style={styles.contentRow}
    >
      <Loader color={finalTextColor} size={22} scaleUtil={scale} />
    </Animatable.View>
  ) : (
    <Animatable.View
      key="content"
      animation="fadeIn"
      duration={220}
      style={styles.contentRow}
    >
      {iconPosition === 'left' && renderIcon()}
      <Text
        style={[
          styles.text,
          { color: finalTextColor, fontSize: scale(15), fontFamily },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </Animatable.View>
  );

  return (
    <Animated.View
      style={[
        styles.outer,
        {
          width: width || '100%',
          borderRadius: radius,
          backgroundColor: !disabled && elevation ? glowColor : 'transparent',
          transform: [
            { translateX: shakeTranslate },
            { scale: pressScale },
            { scale: popScale },
          ],
        },
        shadow,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLayout={e => setBtnWidth(e.nativeEvent.layout.width)}
        android_ripple={
          disabled ? undefined : { color: 'rgba(255,255,255,0.25)' }
        }
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled, busy: loading }}
        style={[styles.pressable, { borderRadius: radius }]}
      >
        {/* Base colour (fades from soft tint to full colour when enabled) */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: baseBg }]}
        />

        {/* Gradient fades in when the button becomes enabled */}
        {isGradient && (
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: enableAnim }]}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              {...gradientProps}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {/* Light sweep */}
        {showShimmer && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              {
                width: shimmerWidth,
                transform: [{ translateX: shimmerX }, { skewX: '-20deg' }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(255,255,255,0)',
                'rgba(255,255,255,0.35)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {content}
      </Pressable>
    </Animated.View>
  );
};

export default Button;

const styles = StyleSheet.create({
  outer: {
    alignSelf: 'center',
    height: BUTTON_HEIGHT,
  },

  pressable: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  text: {
    letterSpacing: 0.3,
  },

  iconBase: {
    marginHorizontal: 5,
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
});
