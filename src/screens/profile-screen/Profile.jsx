/**
 * @file Profile.jsx
 * @module screens/setting-screen/Profile
 * @description Profile tab: centered title, avatar with camera badge, three grouped
 * setting cards (Preferences, Privacy & Security, Support).
 */

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import ProfileCard from '../../utilities/custom-components/card/ProfileCard';
import ProfileSubCard from '../../utilities/custom-components/card/ProfileSubCard';

const Profile = () => {
  useStatusBarConfig('light-content');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape, insets });

  // Local UI state for the two switches
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [biometricOn, setBiometricOn] = useState(false);

  const comingSoon = title =>
    Toast.show({ type: 'info', text1: title, text2: 'Coming soon' });

  const groups = [
    {
      groupTitle: 'Preferences',
      items: [
        {
          id: 'personal_profile',
          title: 'Personal Profile',
          icon: 'person-outline',
        },
        {
          id: 'my_appointments',
          title: 'My Appointments',
          icon: 'calendar-outline',
        },
        { id: 'payment_method', title: 'Payment Method', icon: 'card-outline' },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications-outline',
          toggleValue: notificationsOn,
        },
        {
          id: 'language',
          title: 'Language',
          icon: 'language-outline',
          rightText: 'English',
        },
      ],
    },
    {
      groupTitle: 'Privacy & Security',
      items: [
        {
          id: 'change_password',
          title: 'Change Password',
          icon: 'lock-closed-outline',
        },
        {
          id: 'biometric_lock',
          title: 'Biometric Lock',
          icon: 'finger-print-outline',
          toggleValue: biometricOn,
        },
        {
          id: 'app_permissions',
          title: 'App Permissions',
          icon: 'settings-outline',
        },
      ],
    },
    {
      groupTitle: 'Support',
      items: [
        { id: 'help_center', title: 'Help Center', icon: 'headset-outline' },
        {
          id: 'terms_privacy',
          title: 'Terms and Privacy Policy',
          icon: 'shield-checkmark-outline',
        },
      ],
    },
  ];

  const handleEditPhoto = () => {
    navigation.navigate('Update_Profile');
  };

  const handleItemPress = itemId => {
    switch (itemId) {
      case 'personal_profile':
        handleEditPhoto();
        break;
      case 'my_appointments':
        navigation.navigate('Appointments');
        break;
      case 'change_password':
        navigation.navigate('Change_Password');
        break;
      case 'app_permissions':
        Linking.openSettings();
        break;
      case 'terms_privacy':
        navigation.navigate('Terms_and_Conditions');
        break;
      case 'payment_method':
        comingSoon('Payment Method');
        break;
      case 'language':
        comingSoon('Language');
        break;
      case 'help_center':
        comingSoon('Help Center');
        break;
      default:
        break;
    }
  };

  const handleToggle = (itemId, nextValue) => {
    if (itemId === 'notifications') setNotificationsOn(nextValue);
    if (itemId === 'biometric_lock') setBiometricOn(nextValue);
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animatable.Text
          animation="fadeIn"
          duration={500}
          useNativeDriver
          style={styles.screenTitle}
        >
          Profile
        </Animatable.Text>

        {/* Avatar */}
        <View style={styles.avatarBlock}>
          <ProfileCard profilePicture={null} onEditPress={handleEditPhoto} />
        </View>

        {/* Setting groups */}
        {groups.map((group, index) => (
          <Animatable.View
            key={group.groupTitle}
            animation="fadeInUp"
            duration={600}
            delay={250 + index * 120}
            useNativeDriver
            style={styles.section}
          >
            <ProfileSubCard
              groupTitle={group.groupTitle}
              items={group.items}
              onItemPress={handleItemPress}
              onToggle={handleToggle}
            />
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Profile;

/**
 * Responsive style factory
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape, insets }) => {
  const columnWidth = isLandscape ? Math.min(wp(60), 520) : wp(90);

  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      alignItems: 'center',
      paddingTop: insets.top + wp(5),
      paddingBottom: hp(5) + 10,
    },

    screenTitle: {
      fontSize: moderateScale(19),
      fontFamily: theme.typography.families.poppins.bold,
      color: theme.colors.dark,
      textAlign: 'center',
    },

    avatarBlock: {
      marginTop: wp(6),
      marginBottom: wp(6),
    },

    section: {
      width: columnWidth,
      marginBottom: wp(5.3),
    },
  });
};
