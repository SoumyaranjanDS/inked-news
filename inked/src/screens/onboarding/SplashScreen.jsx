import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, StatusBar, Animated, Easing } from 'react-native';

const PRIMARY_COLOR = '#b30000'; // Deep red background

const SplashScreen = ({ navigation }) => {
  // 1. Journal Icon initial pop and position
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateX = useRef(new Animated.Value(0)).current;
  
  // 2. Text Logo opacity and position
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current; 
  
  // 3. Exit opacity
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1: Journal Icon pops up
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      
      // Phase 2: Hold briefly, then slide left and reveal text
      setTimeout(() => {
        Animated.parallel([
          // Slide the journal icon to the left
          Animated.timing(iconTranslateX, {
            toValue: -75, // Move left
            duration: 700,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          // Fade in the "inked." text
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          // Slide the text slightly to the right to meet the icon perfectly
          Animated.timing(textTranslateX, {
            toValue: 50, // Moved slightly further right to account for larger text size
            duration: 700,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          })
        ]).start(() => {
          // Phase 3: Hold the completed logo for a moment, then fade out
          setTimeout(() => {
            Animated.timing(exitOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start(() => {
              navigation.replace('OnboardingCarousel');
            });
          }, 1200);
        });
      }, 500); // Wait 500ms after the pop-in before sliding
    });
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar hidden />
      
      <View style={styles.logoWrapper}>
        {/* The Text Image (inked.png) */}
        <Animated.Image 
          source={require('../../../public/inked.png')}
          style={[
            styles.textImage, 
            { 
              opacity: textOpacity,
              transform: [{ translateX: textTranslateX }] 
            }
          ]}
          resizeMode="contain"
        />
        
        {/* The Icon Image (journal.png) */}
        <Animated.Image 
          source={require('../../../public/journal.png')}
          style={[
            styles.iconImage, 
            { 
              opacity: iconOpacity,
              transform: [
                { scale: iconScale },
                { translateX: iconTranslateX }
              ] 
            }
          ]}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    position: 'absolute',
    width: 65,
    height: 65,
    tintColor: '#FFFFFF', // Forces the image to be white
  },
  textImage: {
    position: 'absolute',
    width: 300,
    height: 200,
    tintColor: '#FFFFFF', // Forces the image to be white
  }
});

