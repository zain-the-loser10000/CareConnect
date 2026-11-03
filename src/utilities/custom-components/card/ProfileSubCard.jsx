/**
 * @file ProfileSubCard.jsx
 * @module utilities/custom-components/card/ProfileSubCard
 * @description Titled white card of setting rows. A row can be:
 *  - a link:   { id, title, icon, rightText? }   -> chevron (and optional value text)
 *  - a toggle: { id, title, icon, toggleValue }  -> animated switch
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const TRACK_W = 36;
const TRACK_H = 20;
const THUMB = 16;
const TRACK_OFF = '#E5E7EB';

/** Animated pill switch (same look on iOS and Android) */
const Toggle = ({ value, onValueChange }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_OFF, theme.colors.primary],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, TRACK_W - THUMB - 2],
  });

  return (
    <Pressable
      onPress={() => onValueChange && onValueChange(!value)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View style={[toggleStyles.track, { backgroundColor }]}>
        <Animated.View
          style={[toggleStyles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
};

const toggleStyles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

const ProfileSubCard = ({ groupTitle, items = [], onItemPress, onToggle }) => {
  const { wp, moderateScale } = useGlobalStyles();
  const styles = createStyles({ wp, moderateScale });

  return (
    <View>
      {groupTitle ? (
        <Text style={styles.groupHeadingText}>{groupTitle}</Text>
      ) : null}

      <View style={styles.cardContainer}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isToggle = typeof item.toggleValue === 'boolean';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() =>
                isToggle
                  ? onToggle && onToggle(item.id, !item.toggleValue)
                  : onItemPress && onItemPress(item.id)
              }
              style={[styles.rowItem, isLast && styles.noBorder]}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconBubble}>
                  <Ionicons
                    name={item.icon}
                    size={moderateScale(13)}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>

              <View style={styles.rowRight}>
                {isToggle ? (
                  <Toggle
                    value={item.toggleValue}
                    onValueChange={next => onToggle && onToggle(item.id, next)}
                  />
                ) : (
                  <>
                    {item.rightText ? (
                      <Text style={styles.rightText}>{item.rightText}</Text>
                    ) : null}
                    <Ionicons
                      name="chevron-forward"
                      size={moderateScale(14)}
                      color={theme.colors.textPrimary}
                    />
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProfileSubCard;

const createStyles = ({ wp, moderateScale }) => {
  // About 41dp on a 390dp screen, clamped so it stays comfortable to tap
  const rowHeight = Math.min(Math.max(wp(10.8), 42), 52);
  const bubble = moderateScale(24);

  return StyleSheet.create({
    groupHeadingText: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.families.poppins.semiBold,
      color: theme.colors.dark,
      marginBottom: wp(2.5),
    },

    cardContainer: {
      width: '100%',
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(12),
      paddingHorizontal: wp(3),
      shadowColor: theme.colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },

    rowItem: {
      height: rowHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },

    noBorder: {
      borderBottomWidth: 0,
    },

    rowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconBubble: {
      width: bubble,
      height: bubble,
      borderRadius: bubble / 2,
      backgroundColor: theme.colors.primary + '1A',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
    },

    rowTitle: {
      flexShrink: 1,
      fontSize: moderateScale(13),
      fontFamily: theme.typography.families.poppins.regular,
      color: theme.colors.textPrimary,
    },

    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: wp(2),
    },

    rightText: {
      fontSize: moderateScale(12),
      fontFamily: theme.typography.families.poppins.regular,
      color: theme.colors.textMuted,
      marginRight: wp(1),
    },
  });
};
