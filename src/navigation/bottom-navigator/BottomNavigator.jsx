/**
 * @file BottomNavigator.js
 * @module navigation/BottomNavigator
 * @description Curved bottom navigation (no SVG needed).
 * Tabs: Home -> Appointments -> Reports -> Explore -> Profile.
 *
 * The notch is a real transparent cut-out: a small anti-aliased PNG (notch.png)
 * is placed between two solid bar blocks, so the screen behind it shows through.
 * That means no backdrop colour to match, no shadow band and no seam lines.
 * Everything animates on the native driver.
 *
 * Place notch.png in: assets/navigator-icons/notch.png
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Text,
  Image,
  Pressable,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../styles/Themes';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

// --- Screen Imports ---
import HomeScreen from '../../screens/dashboard-screen/Main';
import ProfileScreen from '../../screens/profile-screen/Profile';

const Tab = createBottomTabNavigator();

const NOTCH_IMAGE = require('../../assets/navigator-icons/notch.png');

/* -------------------------------------------------------------------------- */
/*  Design constants (tune these to fine-adjust the look)                      */
/* -------------------------------------------------------------------------- */
const BAR_H = 58; // visible bar height (without safe-area inset)
const ICON_SIZE = 22;
const FAB_ICON_SIZE = 24;

// Horizontal layout
const PAD_FRAC = 0.025; // side padding as a fraction of screen width
const ACTIVE_RATIO = 2.1; // active slot width compared with an inactive slot

// Notch / circle, designed at 390dp width and scaled with the screen.
// NOTCH_IMG_* must match the size notch.png was drawn for.
const DESIGN_WIDTH = 390;
const BUTTON_BASE = 48; // circle diameter
const NOTCH_IMG_W = 150;
const NOTCH_IMG_H = 40;
const OVERLAP = 3; // bar blocks tuck this far under the PNG (hides seams)

const BAR_COLOR = theme.colors.primary; // reference teal is about '#0E8A87'
const INACTIVE = theme.colors.white;

// Tint PNG icons white so they read on the teal bar.
// Set to false if your PNGs are already white or multi-colour.
const TINT_IMAGES = true;

/**
 * Tab configuration (order = tab order).
 * Use `image: require(...)` for a PNG, or `icon` for an Ionicons name.
 */
const TAB_CONFIG = {
  Main: { label: 'Home', icon: 'home-outline' },
  Appointments: {
    label: 'Appointments',
    image: require('../../assets/navigator-icons/appointment-icon.png'),
  },
  Reports: {
    label: 'Reports',
    image: require('../../assets/navigator-icons/report-icon.png'),
  },
  Explore: {
    label: 'Explore',
    image: require('../../assets/navigator-icons/explore-icon.png'),
  },
  Profile: {
    label: 'Profile',
    image: require('../../assets/navigator-icons/profile-icon.png'),
  },
};

const FALLBACK_CONFIG = { label: '', icon: 'ellipse-outline' };

const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{route.name} Screen Placeholder</Text>
  </View>
);

/** Sizes for a given screen width */
const getGeometry = width => {
  const s = Math.min(Math.max(width / DESIGN_WIDTH, 0.85), 1.15);
  return {
    button: BUTTON_BASE * s,
    imgW: NOTCH_IMG_W * s,
    imgH: NOTCH_IMG_H * s,
    overlap: OVERLAP * s,
  };
};

/** PNG icon (optionally tinted) or Ionicons */
const TabIcon = ({ config, size, color }) => {
  if (config.image) {
    return (
      <Image
        source={config.image}
        style={{
          width: size,
          height: size,
          ...(TINT_IMAGES ? { tintColor: color } : null),
        }}
        resizeMode="contain"
      />
    );
  }
  return <Ionicons name={config.icon} size={size} color={color} />;
};

/* -------------------------------------------------------------------------- */
/*  Single tab slot (positioned by the animated `pos` value)                   */
/* -------------------------------------------------------------------------- */
const TabItem = ({
  index,
  pos,
  slotWidth,
  translateX,
  config,
  accessibilityLabel,
  focused,
  onPress,
  onLongPress,
}) => {
  const press = useRef(new Animated.Value(1)).current;

  // The icon fades up into the circle as the notch arrives, and returns as it leaves
  const range = [index - 1, index - 0.5, index + 0.5, index + 1];
  const iconOpacity = pos.interpolate({
    inputRange: range,
    outputRange: [1, 0, 0, 1],
    extrapolate: 'clamp',
  });
  const iconY = pos.interpolate({
    inputRange: range,
    outputRange: [0, -12, -12, 0],
    extrapolate: 'clamp',
  });
  const iconScale = pos.interpolate({
    inputRange: range,
    outputRange: [1, 0.6, 0.6, 1],
    extrapolate: 'clamp',
  });

  const handlePressIn = () =>
    Animated.spring(press, {
      toValue: 0.82,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(press, {
      toValue: 1,
      speed: 24,
      bounciness: 12,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={[styles.slot, { width: slotWidth, transform: [{ translateX }] }]}
    >
      <Pressable
        style={styles.slotPressable}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: focused }}
      >
        <Animated.View
          style={{
            opacity: iconOpacity,
            transform: [
              { translateY: iconY },
              { scale: Animated.multiply(iconScale, press) },
            ],
          }}
        >
          <TabIcon config={config} size={ICON_SIZE} color={INACTIVE} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

/* -------------------------------------------------------------------------- */
/*  Custom tab bar                                                             */
/* -------------------------------------------------------------------------- */
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const count = state.routes.length;
  const geo = useMemo(() => getGeometry(width), [width]);

  // Animated (fractional) index of the active tab, driven natively
  const pos = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(pos, {
      toValue: state.index,
      friction: 9,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [state.index, pos]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  /* ---- Slot layout: the active slot is ACTIVE_RATIO times wider ---------- */
  const pad = width * PAD_FRAC;
  const inactiveW = (width - 2 * pad) / (count - 1 + ACTIVE_RATIO);
  const activeW = inactiveW * ACTIVE_RATIO;

  // x-centre of slot `i` when tab `a` is the active one
  const centerOf = (i, a) => {
    let left;
    if (i <= a) {
      left = pad + i * inactiveW;
    } else {
      left = pad + a * inactiveW + activeW + (i - a - 1) * inactiveW;
    }
    return left + (i === a ? activeW : inactiveW) / 2;
  };

  const inputRange = state.routes.map((_, k) => k);
  const interpolateFor = fn =>
    pos.interpolate({
      inputRange,
      outputRange: inputRange.map(fn),
      extrapolate: 'clamp',
    });

  const activeCenter = k => centerOf(k, k);

  // Notch image sits at the active centre; the two solid blocks butt against it
  const notchX = interpolateFor(k => activeCenter(k) - geo.imgW / 2);
  const leftBlockX = interpolateFor(
    k => activeCenter(k) - geo.imgW / 2 + geo.overlap - width,
  );
  const rightBlockX = interpolateFor(
    k => activeCenter(k) + geo.imgW / 2 - geo.overlap,
  );
  const buttonX = interpolateFor(k => activeCenter(k) - geo.button / 2);

  const barHeight = BAR_H + insets.bottom;

  const activeRoute = state.routes[state.index];
  const activeConfig = TAB_CONFIG[activeRoute.name] || FALLBACK_CONFIG;

  return (
    <View
      style={[styles.container, { height: barHeight }]}
      pointerEvents="box-none"
    >
      {/* Bar: left block + transparent-notch PNG + right block + bottom fill */}
      <View
        pointerEvents="none"
        style={[styles.barLayer, { height: barHeight }]}
      >
        <Animated.View
          style={[
            styles.block,
            {
              width,
              height: geo.imgH + 1,
              transform: [{ translateX: leftBlockX }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.block,
            {
              width,
              height: geo.imgH + 1,
              transform: [{ translateX: rightBlockX }],
            },
          ]}
        />
        <View style={[styles.bottomFill, { top: geo.imgH - 1 }]} />
        <Animated.Image
          source={NOTCH_IMAGE}
          resizeMode="stretch"
          style={[
            styles.notchImage,
            {
              width: geo.imgW,
              height: geo.imgH,
              tintColor: BAR_COLOR,
              transform: [{ translateX: notchX }],
            },
          ]}
        />
      </View>

      {/* Flat circle that follows the active tab (half of it rises above the bar) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.fab,
          {
            width: geo.button,
            height: geo.button,
            borderRadius: geo.button / 2,
            top: -geo.button / 2,
            transform: [{ translateX: buttonX }],
          },
        ]}
      >
        <Animatable.View
          key={activeRoute.key}
          animation="zoomIn"
          duration={260}
          useNativeDriver
        >
          <TabIcon
            config={activeConfig}
            size={FAB_ICON_SIZE}
            color={theme.colors.white}
          />
        </Animatable.View>
      </Animated.View>

      {/* Tab slots */}
      <View style={[styles.slotsLayer, { height: BAR_H }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const config = TAB_CONFIG[route.name] || FALLBACK_CONFIG;
          const label = config.label || options.title || route.name;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              index={index}
              pos={pos}
              slotWidth={inactiveW}
              translateX={interpolateFor(
                k => centerOf(index, k) - inactiveW / 2,
              )}
              config={config}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const renderTabBar = props => <CustomTabBar {...props} />;

/* -------------------------------------------------------------------------- */
/*  Navigator                                                                  */
/* -------------------------------------------------------------------------- */
const BottomNavigator = () => {
  useStatusBarConfig();

  return (
    <Tab.Navigator
      initialRouteName="Main"
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Main" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={PlaceholderScreen} />
      <Tab.Screen name="Reports" component={PlaceholderScreen} />
      <Tab.Screen name="Explore" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  // No background: the circle rises over the screen and the notch is transparent
  container: {
    overflow: 'visible',
  },

  barLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },

  block: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BAR_COLOR,
  },

  bottomFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: BAR_COLOR,
  },

  notchImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  fab: {
    position: 'absolute',
    left: 0,
    backgroundColor: BAR_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },

  slotsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  slot: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: BAR_H,
  },

  slotPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  placeholderText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.families.poppins.semiBold,
    color: theme.colors.textMuted,
  },
});
