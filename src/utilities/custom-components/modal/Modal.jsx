/**
 * @file Modal.jsx
 * @module utilities/custom-components/modal/Modal
 * @description Responsive modal with animated presentation, keyboard avoidance, and orientation-aware layout.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import Loader from '../loader/Loader';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const Modal = ({
  isOpen,
  onClose,
  title = '',
  subtitle = '',
  children,
  buttons = [],
  icon,
  contentStyle,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  // Keep the native modal mounted until its closing animation has completed.
  const [isMounted, setIsMounted] = useState(isOpen);

  // Separate animated values allow the backdrop and dialog to transition independently.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (isOpen) {
      // Mount before starting the entrance transition so the native modal is visible.
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade and contract the dialog before removing it from the native view hierarchy.
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 12,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [isOpen, fadeAnim, scaleAnim, translateYAnim]);

  if (!isMounted) return null;

  // The native modal provides platform-level presentation and back-button handling.
  return (
    <RNModal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { translateY: translateYAnim },
                    ],
                  },
                  contentStyle,
                ]}
              >
                {/* Optional title, subtitle, and close control. */}
                {(title || subtitle || showCloseButton) && (
                  <View style={styles.headerContainer}>
                    <View style={styles.headerTextWrapper}>
                      {title ? (
                        <Text style={styles.titleText}>{title}</Text>
                      ) : null}
                      {subtitle ? (
                        <Text style={styles.subtitleText}>{subtitle}</Text>
                      ) : null}
                    </View>

                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                        style={styles.closeActionTarget}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.closeVectorSymbol}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Scrollable content keeps long dialogs usable on smaller screens. */}
                <ScrollView
                  style={styles.bodyScrollViewContainer}
                  contentContainerStyle={styles.bodyContentWrapper}
                  showsVerticalScrollIndicator={true}
                  indicatorStyle="white"
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.structuralBodyFrame}>
                    {icon && (
                      <View style={styles.iconDecoratorFrame}>{icon}</View>
                    )}

                    {typeof children === 'string' ? (
                      <Text style={styles.fallbackBodyText}>{children}</Text>
                    ) : (
                      children
                    )}
                  </View>
                </ScrollView>

                {/* Optional actions are rendered in the order supplied by the caller. */}
                {buttons.length > 0 && (
                  <View style={styles.footerActionContainer}>
                    {buttons.map((btn, idx) => {
                      const variant = btn.variant || 'primary';
                      const isDanger = variant === 'danger';
                      const isSecondary =
                        variant === 'secondary' || variant === 'cancel';

                      return (
                        <TouchableOpacity
                          key={`modal-btn-${idx}`}
                          onPress={btn.onClick}
                          disabled={btn.loading || btn.disabled}
                          activeOpacity={0.75}
                          style={[
                            styles.actionButton,
                            isSecondary && styles.btnSecondaryMod,
                            isDanger && styles.btnDangerMod,
                            btn.loading && styles.btnLoadingMod,
                            btn.disabled && styles.btnDisabledMod,
                          ]}
                        >
                          {btn.loading ? (
                            <Loader
                              size="small"
                              color={
                                isDanger
                                  ? theme.colors.error
                                  : theme.colors.white
                              }
                            />
                          ) : (
                            <Text
                              style={[
                                styles.actionButtonText,
                                isSecondary && styles.txtSecondaryMod,
                                isDanger && styles.txtDangerMod,
                              ]}
                            >
                              {btn.label}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;

/** Creates orientation-aware styles using the application's responsive helpers. */
const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    keyboardAvoidContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalContent: {
      width: isLandscape ? wp(68) : wp(88),
      maxWidth: isLandscape ? wp(68) : wp(88),
      maxHeight: isLandscape ? hp(84) : hp(78),
      borderRadius: theme.borderRadius.large,
      paddingHorizontal: isLandscape ? wp(4) : wp(5),
      paddingTop: isLandscape ? hp(3) : hp(2.5),
      paddingBottom: isLandscape ? hp(3) : hp(2.5),
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.elevation.depth3,
      overflow: 'hidden',
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      paddingBottom: hp(1.5),
      marginBottom: hp(1.5),
    },

    headerTextWrapper: {
      flex: 1,
      paddingRight: wp(2),
    },

    titleText: {
      fontFamily: theme.typography.families.poppins.bold,
      fontSize: moderateScale(theme.typography.fontSize.lg),
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },

    subtitleText: {
      fontFamily: theme.typography.families.poppins.regular,
      fontSize: moderateScale(theme.typography.fontSize.xs),
      color: theme.colors.textMuted,
      marginTop: hp(0.4),
      lineHeight: moderateScale(17),
    },

    closeActionTarget: {
      paddingHorizontal: wp(1),
      paddingVertical: hp(0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },

    closeVectorSymbol: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.families.poppins.bold,
      color: theme.colors.error,
      opacity: 0.9,
    },

    bodyScrollViewContainer: {
      flexGrow: 0,
    },

    bodyContentWrapper: {
      flexGrow: 1,
    },

    structuralBodyFrame: {
      paddingVertical: hp(0.5),
    },

    fallbackBodyText: {
      fontFamily: theme.typography.families.poppins.medium,
      fontSize: moderateScale(theme.typography.fontSize.sm),
      color: theme.colors.textPrimary,
      lineHeight: moderateScale(21),
    },

    iconDecoratorFrame: {
      alignItems: 'center',
      marginBottom: hp(1.5),
    },

    footerActionContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: wp(3),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: hp(1.8),
      marginTop: hp(1),
    },

    actionButton: {
      paddingVertical: isLandscape ? hp(1.4) : hp(1.2),
      paddingHorizontal: wp(4.5),
      borderRadius: theme.borderRadius.medium,
      minWidth: isLandscape ? wp(14) : wp(22),
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    btnSecondaryMod: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    btnDangerMod: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.error,
    },

    btnLoadingMod: {
      opacity: 0.8,
    },

    btnDisabledMod: {
      backgroundColor: theme.colors.gray,
      borderColor: 'transparent',
      opacity: 0.5,
    },

    actionButtonText: {
      fontFamily: theme.typography.families.poppins.semiBold,
      fontSize: moderateScale(theme.typography.fontSize.xs),
      color: theme.colors.white,
    },

    txtSecondaryMod: {
      color: theme.colors.textPrimary,
    },

    txtDangerMod: {
      color: theme.colors.error,
    },
  });
