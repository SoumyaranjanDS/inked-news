import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(12)).current;
  const glowScale = useRef(new Animated.Value(0.3)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => navigation.replace('OnboardingCarousel'));
      }, 1400);
    });
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AnimatedGradient
        colors={['rgba(211,47,47,0.6)', 'rgba(211,47,47,0.15)', 'transparent']}
        style={[
          styles.glow,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetters}>in</Text>
        </View>
        <Text style={styles.logoText}>inked.</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
        ]}
      >
        Stay informed. Stay ahead.
      </Animated.Text>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: width * 0.9,
    alignSelf: 'center',
    top: height * 0.5 - width * 0.9,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoLetters: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
    fontWeight: '400',
    marginTop: 4,
  },
});
