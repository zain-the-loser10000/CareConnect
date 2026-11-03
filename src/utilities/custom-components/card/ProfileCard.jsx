/**
 * @file ProfileCard.jsx
 * @module utilities/custom-components/card/ProfileCard
 * @description Centered profile avatar: teal ring, small gap, photo, and a camera badge
 * on the lower-right edge of the ring.
 */

import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const ProfileCard = ({ profilePicture, onEditPress }) => {
  const { wp, moderateScale } = useGlobalStyles();

  // Outer ring size follows the screen width but stays within a sensible range
  const ringSize = Math.min(Math.max(wp(22.3), 84), 112);
  const styles = createStyles({ ringSize, moderateScale });

  return (
    <Animatable.View
      animation="zoomIn"
      duration={600}
      delay={100}
      useNativeDriver
      style={styles.wrapper}
    >
      <View style={styles.ring}>
        <Image
          source={
            profilePicture && profilePicture.length > 0
              ? { uri: profilePicture }
              : require('../../../assets/placeHolder/placeholder.png')
          }
          style={styles.avatar}
        />
      </View>

      <TouchableOpacity
        style={styles.cameraBadge}
        activeOpacity={0.8}
        onPress={onEditPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
      >
        <Ionicons
          name="camera-outline"
          size={moderateScale(12)}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default ProfileCard;

const createStyles = ({ ringSize, moderateScale }) => {
  const ringWidth = 2;
  const gap = 3;
  const avatarSize = ringSize - (ringWidth + gap) * 2;
  const badgeSize = Math.round(ringSize * 0.25);

  return StyleSheet.create({
    wrapper: {
      width: ringSize,
      height: ringSize,
      alignSelf: 'center',
    },

    ring: {
      width: ringSize,
      height: ringSize,
      borderRadius: ringSize / 2,
      borderWidth: ringWidth,
      borderColor: theme.colors.primary,
      padding: gap,
      backgroundColor: theme.colors.white,
    },

    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: theme.colors.background,
    },

    cameraBadge: {
      position: 'absolute',
      right: ringSize * 0.02,
      bottom: ringSize * 0.02,
      width: badgeSize,
      height: badgeSize,
      borderRadius: badgeSize / 2,
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
  });
};
