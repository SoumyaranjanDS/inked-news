import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  BackHandler,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, User } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const { width } = Dimensions.get('window');

const TAB_ITEMS = [
  { name: 'Search', label: 'Discover', Icon: Search },
  { name: 'Home', label: 'Home', Icon: Home },
  { name: 'Profile', label: 'Profile', Icon: User },
];

const TabItem = ({ item, isFocused, onPress, isDark }) => {
  const [scaleAnim] = React.useState(() => new Animated.Value(isFocused ? 1.12 : 1));
  const [dotAnim] = React.useState(() => new Animated.Value(isFocused ? 1 : 0));

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
  }, [isFocused, scaleAnim, dotAnim]);

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
      <Text
        style={[
          styles.label,
          { color: isDark ? '#888' : '#9E9E9E' },
          isFocused && styles.labelActive,
        ]}
      >
        {item.label}
      </Text>
      <Animated.View
        style={[styles.dot, { opacity: dotAnim, transform: [{ scaleX: dotAnim }] }]}
      />
    </TouchableOpacity>
  );
};

const MainTabs = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [activeIndex, setActiveIndex] = useState(1); // Default to Home (Index 1)
  const scrollRef = useRef(null);

  // Initialize position to Home tab on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: width, animated: false });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Hardware Back Button Handler:
  // - If on Home tab (index 1) -> Exit app immediately.
  // - If on Search (0) or Profile (2) -> Return to Home tab.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (activeIndex === 1) {
          BackHandler.exitApp();
          return true;
        } else {
          setActiveIndex(1);
          scrollRef.current?.scrollTo({ x: width, animated: true });
          return true;
        }
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [activeIndex])
  );

  const handleTabPress = (index) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleMomentumScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex <= 2) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDark ? '#0D0D0D' : '#F5F5F5' }]}>
      {/* Horizontal Swipeable Pager with nestedScrollEnabled */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentOffset={{ x: width, y: 0 }}
        style={styles.pager}
      >
        {/* Tab 0: Discover / Search Screen */}
        <View style={{ width, flex: 1 }}>
          <SearchScreen navigation={navigation} />
        </View>

        {/* Tab 1: Home Screen */}
        <View style={{ width, flex: 1 }}>
          <HomeScreen navigation={navigation} />
        </View>

        {/* Tab 2: Profile Screen */}
        <View style={{ width, flex: 1 }}>
          <ProfileScreen navigation={navigation} />
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            backgroundColor: isDark ? '#111' : '#FFF',
            borderTopColor: isDark ? '#222' : '#F0F0F0',
          },
        ]}
      >
        <View style={styles.bar}>
          {TAB_ITEMS.map((item, index) => {
            const isFocused = activeIndex === index;
            return (
              <TabItem
                key={item.name}
                item={item}
                isFocused={isFocused}
                onPress={() => handleTabPress(index)}
                isDark={isDark}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default MainTabs;

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
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
