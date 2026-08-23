import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, Bookmark, User } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

import HomeScreen from '../screens/main/HomeScreen';

const DiscoverScreen = () => <View style={{ flex: 1, backgroundColor: '#0D0D0D' }} />;
const SavedScreen = () => <View style={{ flex: 1, backgroundColor: '#0D0D0D' }} />;
const ProfileScreen = () => <View style={{ flex: 1, backgroundColor: '#0D0D0D' }} />;

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TAB_ARR = [
  { route: 'Home', label: 'Home', icon: Home, component: HomeScreen },
  { route: 'Discover', label: 'Explore', icon: Compass, component: DiscoverScreen },
  { route: 'Saved', label: 'Saved', icon: Bookmark, component: SavedScreen },
  { route: 'Profile', label: 'Profile', icon: User, component: ProfileScreen },
];

const TabButton = ({ item, onPress, accessibilityState, isDark }) => {
  const focused = accessibilityState.selected;
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1 : 0,
      friction: 5,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const Icon = item.icon;

  const bgOpacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const textWidth = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.tabBtn}>
      <Animated.View style={[
        styles.tabInner, 
        { 
          backgroundColor: bgOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['transparent', isDark ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.1)']
          }) 
        }
      ]}>
        <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
           <Icon 
             size={22} 
             color={focused ? '#D32F2F' : (isDark ? '#888' : '#999')} 
             strokeWidth={focused ? 2.5 : 2} 
           />
        </Animated.View>
        
        {focused && (
          <Animated.View style={{ width: textWidth, overflow: 'hidden', marginLeft: 6 }}>
            <Text style={styles.tabLabel} numberOfLines={1}>{item.label}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom || 12 }]}>
      <LinearGradient
        colors={isDark ? ['transparent', 'rgba(0,0,0,0.8)', '#000'] : ['transparent', 'rgba(255,255,255,0.9)', '#FFF']}
        style={[StyleSheet.absoluteFill, { borderTopWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
        pointerEvents="none"
      />
      <View style={[styles.tabBarWrap, { backgroundColor: isDark ? '#111' : '#FFF', borderColor: isDark ? '#222' : '#EEE' }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const item = TAB_ARR.find(t => t.route === route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton 
              key={index} 
              item={item} 
              onPress={onPress} 
              accessibilityState={{ selected: isFocused }} 
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_ARR.map((item, index) => (
        <Tab.Screen key={index} name={item.route} component={item.component} />
      ))}
    </Tab.Navigator>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    zIndex: 100,
  },
  tabBarWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
  },
  tabBtn: {
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
    color: '#9E9E9E',
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
