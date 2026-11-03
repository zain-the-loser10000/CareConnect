/**
 * @file InputField.jsx
 * @module Components/InputField
 * @description Reusable, animated, cross-orientation theme-consistent input field.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const ERROR_TINT = theme.colors.white;

// Fixed height in dp. Not passed through moderateScale, which was
// inflating the field on large or high-density screens.
const INPUT_HEIGHT = 44;

const InputField = ({
  label,
  error,
  containerStyle,
  value,
  onChangeText,
  placeholder = '',
  placeholderTextColor,
  inputStyle,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  multiline = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const responsiveValues = useGlobalStyles();
  const { moderateScale } = responsiveValues;
  const styles = createStyles({ ...responsiveValues, multiline });

  const hasError = !!error;

  // 0 = idle, 1 = focused, 2 = error (drives colours, glow and icon pop)
  const stateAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const iconPress = useRef(new Animated.Value(1)).current;
  const prevHasError = useRef(false);

  useEffect(() => {
    Animated.timing(stateAnim, {
      toValue: hasError ? 2 : isFocused ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [hasError, isFocused, stateAnim]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Shake when an error appears while the user is NOT typing in this field
  // (typing "a" in an email field should not shake on every key)
  useEffect(() => {
    if (hasError && !prevHasError.current && !isFocused) {
      shake();
    }
    prevHasError.current = hasError;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  const handleFocus = e => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = e => {
    setIsFocused(false);
    if (hasError) shake();
    if (onBlur) onBlur(e);
  };

  const handleRightIconPress = () => {
    Animated.sequence([
      Animated.timing(iconPress, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(iconPress, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
    if (onRightIconPress) onRightIconPress();
  };

  // Interpolations
  const range = [0, 1, 2];

  const borderColor = stateAnim.interpolate({
    inputRange: range,
    outputRange: [
      theme.colors.border,
      theme.colors.primary,
      theme.colors.error,
    ],
  });

  const backgroundColor = stateAnim.interpolate({
    inputRange: range,
    outputRange: [theme.colors.white, theme.colors.background, ERROR_TINT],
  });

  const labelColor = stateAnim.interpolate({
    inputRange: range,
    outputRange: [theme.colors.dark, theme.colors.primary, theme.colors.error],
  });

  const glowOpacity = stateAnim.interpolate({
    inputRange: range,
    outputRange: [0, 0.2, 0.15],
  });

  const glowElevation = stateAnim.interpolate({
    inputRange: range,
    outputRange: [0, 3, 2],
  });

  const leftIconScale = stateAnim.interpolate({
    inputRange: range,
    outputRange: [1, 1.14, 1],
  });

  const shakeX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-6, 6],
  });

  return (
    <Animated.View
      style={[
        styles.baseContainer,
        !editable && styles.disabled,
        containerStyle,
        { transform: [{ translateX: shakeX }] },
      ]}
    >
      {/* Optional Label */}
      {label ? (
        <Animated.Text style={[styles.inputLabel, { color: labelColor }]}>
          {label}
        </Animated.Text>
      ) : null}

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
            shadowOpacity: glowOpacity,
            elevation: glowElevation,
          },
        ]}
      >
        {/* Left Icon Slot */}
        {leftIcon && (
          <Animated.View
            style={[
              styles.leftIconContainer,
              { transform: [{ scale: leftIconScale }] },
            ]}
          >
            {leftIcon}
          </Animated.View>
        )}

        {/* Core Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.textInput, multiline && styles.multiline, inputStyle]}
          {...rest}
        />

        {/* Right Interactive Icon Slot */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleRightIconPress}
            activeOpacity={0.7}
            disabled={!onRightIconPress}
            hitSlop={{
              top: responsiveValues.hp(1.5),
              bottom: responsiveValues.hp(1.5),
              left: responsiveValues.wp(3),
              right: responsiveValues.wp(3),
            }}
          >
            <Animated.View style={{ transform: [{ scale: iconPress }] }}>
              {rightIcon}
            </Animated.View>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error Message */}
      {hasError ? (
        <Animatable.View
          key={error}
          animation="fadeInDown"
          duration={260}
          style={styles.errorRow}
        >
          <Ionicons
            name="alert-circle"
            size={moderateScale(14)}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>{error}</Text>
        </Animatable.View>
      ) : null}
    </Animated.View>
  );
};

export default InputField;

/**
 * Responsive Style Sheet Construction Factory
 */
const createStyles = ({ moderateScale, wp, hp, multiline }) => {
  return StyleSheet.create({
    baseContainer: {
      width: '100%',
      marginVertical: hp(0.5),
    },

    disabled: {
      opacity: 0.6,
    },

    inputLabel: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(13),
      marginBottom: hp(0.6),
      paddingLeft: wp(1),
    },

    inputWrapper: {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      borderWidth: moderateScale(1.5),
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: wp(3),
      // Normal single-line height; multiline grows from a minimum
      ...(multiline
        ? { minHeight: hp(12), paddingTop: hp(0.5) }
        : { height: INPUT_HEIGHT }),
      // Soft glow (opacity + elevation are animated)
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
    },

    textInput: {
      flex: 1,
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(14),
      color: theme.colors.primary,
      paddingVertical: 0,
      paddingHorizontal: wp(2),
    },

    multiline: {
      minHeight: hp(11),
      textAlignVertical: 'top',
      paddingVertical: hp(1.2),
    },

    leftIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(1),
    },

    rightIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(1),
      padding: wp(1),
    },

    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(0.5),
      paddingLeft: wp(1),
      gap: wp(1.2),
    },

    errorText: {
      flexShrink: 1,
      fontFamily: theme.typography.families.poppins.light,
      fontSize: moderateScale(12),
      color: theme.colors.error,
    },
  });
};
