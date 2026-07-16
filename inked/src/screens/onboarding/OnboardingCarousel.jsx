import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const PRIMARY_COLOR = '#d60000f0';

const DEFAULT_ARTICLES = [
  {
    id: '1',
    category: 'TRENDING',
    title: 'Loading latest news...',
    image: 'https://i.pinimg.com/736x/26/26/f6/2626f652abccbf2bcc705b394e8bdd04.jpg',
  },
];

const OnboardingCarousel = ({ navigation }) => {
  const [articles, setArticles] = useState(DEFAULT_ARTICLES);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // 1. Fetch Trending News
    fetch('http://localhost:5000/api/trending?q=india&limit=3')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const formattedArticles = data.data.map(item => ({
            id: item._id,
            category: item.source ? item.source.toUpperCase() : 'TRENDING',
            title: item.headline,
            date: item.date || 'Today',
            time: item.time || '12:00 pm',
            image: item.image_link || 'https://i.pinimg.com/736x/26/26/f6/2626f652abccbf2bcc705b394e8bdd04.jpg',
          }));
          setArticles(formattedArticles);
        }
      })
      .catch(err => console.log('Error fetching trending news:', err));

    // 2. Start fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      <Animated.ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
          },
        )}
      >
        {articles.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            
            {/* TOP HALF: IMAGE */}
            <View style={styles.topHalf}>
              <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
              
              {/* Subtle gradient at the bottom of the image for "Breaking News" text readability */}
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              />
              
              {/* Globe Icon Top Right */}
              <View style={[styles.globeIconContainer, { top: Math.max(insets.top, 20) }]}>
                <Text style={styles.globeIcon}>🌐</Text>
              </View>

              {/* Breaking News Text */}
              <View style={styles.breakingNewsContainer}>
                <Text style={styles.breakingNewsText}>Breaking{'\n'}News</Text>
              </View>
            </View>

            {/* BOTTOM HALF: SOLID RED */}
            <View style={styles.bottomHalf}>
              {/* Slanted decoration top right */}
              <View style={styles.slantedCorner} />

              <View style={styles.bottomContent}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.title} numberOfLines={5}>{item.title}</Text>
                
                <Text style={styles.dateTime}>
                  {item.date} / {item.time}
                </Text>

                <View style={styles.divider} />

                {index === articles.length - 1 && (
                  <TouchableOpacity 
                    style={styles.getStartedButton}
                    onPress={() => navigation.navigate('InterestSelection')}
                  >
                    <Text style={styles.getStartedText}>GET STARTED</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </View>
        ))}
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default OnboardingCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  slide: {
    width,
    height,
    flexDirection: 'column',
  },
  
  /* TOP HALF (IMAGE) */
  topHalf: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  globeIconContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  globeIcon: {
    fontSize: 28,
    color: '#FFF',
  },
  breakingNewsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  breakingNewsText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },

  /* BOTTOM HALF (RED) */
  bottomHalf: {
    height: '50%',
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    position: 'relative',
  },
  slantedCorner: {
    position: 'absolute',
    top: -20,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 80,
    borderTopWidth: 20,
    borderRightColor: PRIMARY_COLOR,
    borderTopColor: 'transparent',
  },
  bottomContent: {
    flex: 1,
    padding: 24,
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  category: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  dateTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 20,
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  getStartedText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
