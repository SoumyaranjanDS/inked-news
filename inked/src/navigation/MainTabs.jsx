import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutGrid, Search, Bookmark, CircleUser } from 'lucide-react-native';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import SavedScreen from '../screens/main/SavedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const ACTIVE_COLOR = '#d60000f0';
const INACTIVE_COLOR = '#A0A0A0';

// Mathematical constraints to perfectly prevent layout jumping
const TAB_BAR_WIDTH = width;
const USABLE_WIDTH = TAB_BAR_WIDTH - 20; 
const INACTIVE_WIDTH = USABLE_WIDTH / 5.5; 
const ACTIVE_WIDTH = USABLE_WIDTH - (INACTIVE_WIDTH * 3); 

const BubbleItem = ({ isFocused, onPress, label, IconComponent }) => {
  const animatedValue = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, { 
      toValue: isFocused ? 1 : 0, 
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false // Required for width/color animations
    }).start();
  }, [isFocused]);

  // Interpolations
  const itemWidth = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [INACTIVE_WIDTH, ACTIVE_WIDTH] });
  const backgroundColor = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['transparent', '#FFEAEA'] });
  
  // By animating a wrapper but keeping the inner text fixed width, we eliminate ALL text wrapping jitter (glitter effect)
  const textWrapperWidth = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 55] });
  const textOpacity = animatedValue.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const marginLeft = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });

  return (
    <Animated.View style={{ width: itemWidth, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ width: '100%', alignItems: 'center' }}>
        <Animated.View style={[
          styles.bubbleContainer, 
          { backgroundColor }
        ]}>
          <IconComponent color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR} size={22} strokeWidth={isFocused ? 2.5 : 2} />
          
          <Animated.View style={{ 
            width: textWrapperWidth, 
            opacity: textOpacity, 
            marginLeft, 
            overflow: 'hidden' 
          }}>
            {/* The fixed inner view stops the text from wrapping or jumping during the width animation */}
            <View style={{ width: 60, justifyContent: 'center' }}>
              <Text style={styles.bubbleText} numberOfLines={1}>{label}</Text>
            </View>
          </Animated.View>

        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.tabBarBackground, { height: 65 + insets.bottom, paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          let IconComponent = LayoutGrid;
          if (label === 'Search') IconComponent = Search;
          if (label === 'Saved') IconComponent = Bookmark;
          if (label === 'Profile') IconComponent = CircleUser;

          return (
            <BubbleItem 
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              label={label}
              IconComponent={IconComponent}
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
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 65,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  bubbleContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  bubbleText: {
    color: ACTIVE_COLOR, 
    fontWeight: '600', 
    fontSize: 13,
    letterSpacing: -0.2,
  }
});
