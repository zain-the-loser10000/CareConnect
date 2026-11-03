/**
 * @file Signin.jsx
 * @module screens/auth-screen/Signin
 * @description Premium animated healthcare sign-in screen.
 * Sequence: header logo beats, white sheet slides up, form blocks reveal in order.
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import Logo from '../../assets/logo/logo.png';
import AuthHeader from '../../utilities/custom-components/header/auth-header/AuthHeader';
import InputField from '../../utilities/custom-components/input-field/InputField';
import Button from '../../utilities/custom-components/button/Button';
import {
  validatePassword,
  validateEmail,
} from '../../utilities/custom-components/validation/Validation';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

// Needed on Android for LayoutAnimation (checklist expand / collapse)
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PASSWORD_RULES = [
  {
    id: 'uppercase',
    label: 'At least one uppercase letter required',
    test: val => /[A-Z]/.test(val),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter required',
    test: val => /[a-z]/.test(val),
  },
  {
    id: 'length',
    label: 'Password length must be 8-20 characters',
    test: val => val.length >= 8 && val.length <= 20,
  },
  {
    id: 'numeric',
    label: 'At least one numeric digit required',
    test: val => /\d/.test(val),
  },
  {
    id: 'special',
    label: 'At least one special character required',
    test: val => /[\W_]/.test(val),
  },
];

// Reveal order inside the sheet (ms)
const SHEET_DELAY = 150;
const STAGGER_START = 550;
const STAGGER_STEP = 100;

const animateLayout = () =>
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

const Signin = () => {
  useStatusBarConfig('light-content', 'transparent', true);

  const navigation = useNavigation();

  const responsiveValues = useGlobalStyles();
  const { moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  const formRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const isButtonEnabled =
    !!email && !!password && !emailError && !passwordError;
  const allRulesPassed = PASSWORD_RULES.every(rule => rule.test(password));
  const showChecklist = isPasswordFocused && !allRulesPassed;

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    animateLayout();
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.tertiary,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Animated header */}
          <AuthHeader
            logo={Logo}
            title="Welcome back"
            subtitle="Sign in to continue"
          />

          {/* White sheet slides up from the bottom */}
          <Animatable.View
            animation="slideInUp"
            duration={700}
            delay={SHEET_DELAY}
            easing="ease-out-cubic"
            useNativeDriver
            style={styles.sheet}
          >
            {/* Fields */}
            <Animatable.View
              ref={formRef}
              animation="fadeInUp"
              duration={600}
              delay={STAGGER_START}
              useNativeDriver
            >
              <InputField
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
                leftIcon={
                  <Ionicons
                    name="mail-outline"
                    size={moderateScale(16)}
                    color={theme.colors.primary}
                  />
                }
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                onFocus={() => {
                  animateLayout();
                  setIsPasswordFocused(true);
                }}
                onBlur={() => {
                  animateLayout();
                  setIsPasswordFocused(false);
                }}
                error={passwordError && !password ? passwordError : ''}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={moderateScale(16)}
                    color={theme.colors.primary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                    size={moderateScale(16)}
                    color={theme.colors.textMuted}
                  />
                }
                onRightIconPress={() => setHidePassword(prev => !prev)}
              />

              {/* Password checklist */}
              {showChecklist && (
                <Animatable.View
                  animation="fadeIn"
                  duration={300}
                  style={styles.checklistContainer}
                >
                  {PASSWORD_RULES.map(rule => {
                    const isValid = rule.test(password);
                    const color = isValid
                      ? theme.colors.success
                      : theme.colors.error;
                    return (
                      <View key={rule.id} style={styles.checklistItem}>
                        <Ionicons
                          name={isValid ? 'checkmark-circle' : 'close-circle'}
                          size={moderateScale(16)}
                          color={color}
                        />
                        <Text style={[styles.checklistText, { color }]}>
                          {rule.label}
                        </Text>
                      </View>
                    );
                  })}
                </Animatable.View>
              )}
            </Animatable.View>

            {/* Remember me + Forgot password */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={STAGGER_START + STAGGER_STEP}
              useNativeDriver
              style={styles.optionsRow}
            >
              <TouchableOpacity
                style={styles.rememberRow}
                activeOpacity={0.7}
                onPress={() => setRememberMe(prev => !prev)}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxOn]}
                >
                  {rememberMe && (
                    <Animatable.View animation="zoomIn" duration={180}>
                      <Ionicons
                        name="checkmark"
                        size={moderateScale(10)}
                        color={theme.colors.white}
                      />
                    </Animatable.View>
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Forgot_Password')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </Animatable.View>

            {/* CTA */}
            <Animatable.View
              animation="fadeInUp"
              duration={600}
              delay={STAGGER_START + STAGGER_STEP * 2}
              useNativeDriver
            >
              <Button
                title="Sign in"
                disabled={!isButtonEnabled}
                gradientColors={[
                  theme.colors.primaryLight,
                  theme.colors.primary,
                ]}
                textColor={theme.colors.white}
                iconName="arrow-forward-circle-outline"
                iconPosition="right"
                elevation="depth2"
              />
            </Animatable.View>

            {/* Sign up link */}
            <Animatable.View
              animation="fadeIn"
              duration={600}
              delay={STAGGER_START + STAGGER_STEP * 3}
              useNativeDriver
              style={styles.footer}
            >
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signin;

const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.tertiary,
    },

    keyboardView: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
    },

    sheet: {
      flexGrow: 1,
      width: isLandscape ? wp(70) : '100%',
      alignSelf: 'center',
      backgroundColor: theme.colors.white,
      borderTopLeftRadius: moderateScale(32),
      borderTopRightRadius: moderateScale(32),
      paddingHorizontal: wp(6),
      paddingTop: hp(4),
      paddingBottom: hp(4),
    },

    checklistContainer: {
      marginTop: hp(0.6),
      paddingHorizontal: wp(1),
      paddingVertical: hp(1),
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.background,
    },

    checklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(0.25),
      paddingLeft: wp(2),
    },

    checklistText: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(12.5),
      marginLeft: wp(2),
    },

    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: hp(1.5),
      marginBottom: hp(3),
      paddingHorizontal: wp(1),
    },

    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    checkbox: {
      width: moderateScale(14),
      height: moderateScale(14),
      borderRadius: moderateScale(4),
      borderWidth: 1.6,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(2),
    },

    checkboxOn: {
      backgroundColor: theme.colors.primary,
    },

    rememberText: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(13.5),
      color: theme.colors.textPrimary,
    },

    forgotText: {
      fontFamily: theme.typography.families.poppins.semiBold,
      fontSize: moderateScale(13),
      color: theme.colors.primary,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginTop: hp(3.5),
      gap: wp(1.5),
    },

    footerText: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(14),
      color: theme.colors.textMuted,
    },

    signupLink: {
      fontFamily: theme.typography.families.poppins.semiBold,
      fontSize: moderateScale(14),
      color: theme.colors.primary,
    },
  });
};
