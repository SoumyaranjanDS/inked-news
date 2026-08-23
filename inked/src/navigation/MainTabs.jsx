import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, User } from 'lucide-react-native';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ITEMS = [
  { name: 'Search', label: 'Discover', Icon: Search },
  { name: 'Home', label: 'Home', Icon: Home },
  { name: 'Profile', label: 'Profile', Icon: User },
];

const TabItem = ({ item, isFocused, onPress, isDark }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(dotAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const { Icon } = item;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <Icon
          size={22}
          color={isFocused ? '#D32F2F' : (isDark ? '#888' : '#9E9E9E')}
          strokeWidth={isFocused ? 2.5 : 1.8}
        />
      </Animated.View>
      <Text style={[styles.label, { color: isDark ? '#888' : '#9E9E9E' }, isFocused && styles.labelActive]}>
        {item.label}
      </Text>
      <Animated.View style={[styles.dot, { opacity: dotAnim, transform: [{ scaleX: dotAnim }] }]} />
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View style={[
      styles.container, 
      { 
        paddingBottom: Math.max(insets.bottom, 8),
        backgroundColor: isDark ? '#111' : '#FFF',
        borderTopColor: isDark ? '#222' : '#F0F0F0'
      }
    ]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const item = TAB_ITEMS.find(t => t.name === route.name);
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return <TabItem key={route.key} item={item} isFocused={isFocused} onPress={onPress} isDark={isDark} />;
        })}
      </View>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainTabs;

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    position: 'relative',
  },
  iconWrap: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#D32F2F',
  },
  dot: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D32F2F',
  },
});
