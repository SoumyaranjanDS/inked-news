import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  const [logoScale] = React.useState(() => new Animated.Value(0.8));
  const [logoOpacity] = React.useState(() => new Animated.Value(0));
  const [exitOpacity] = React.useState(() => new Animated.Value(1));

  useEffect(() => {
    // Short, direct animation
    Animated.parallel([
      Animated.timing(logoScale, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const checkOnboarding = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setTimeout(() => {
          Animated.timing(exitOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            if (hasLaunched === 'true') {
              navigation.replace('Main');
            } else {
              navigation.replace('OnboardingCarousel');
            }
          });
        }, 1000); // Short display time
      } catch (err) {
        setTimeout(() => navigation.replace('OnboardingCarousel'), 1000);
      }
    };

    checkOnboarding();
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Text style={styles.logoText}>inked.</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D32F2F', // Solid Red Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: { 
    alignItems: 'center', 
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF', // White Logo
    letterSpacing: -2,
  },
});
