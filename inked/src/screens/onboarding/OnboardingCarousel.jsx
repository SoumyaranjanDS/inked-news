import React, { useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, StatusBar, Animated,
  Dimensions, TouchableOpacity, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Zap, Globe2, Brain } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: Globe2, label: 'Global Coverage', desc: 'News from 50+ sources worldwide, curated in real time.' },
  { icon: Zap, label: 'Breaking Alerts', desc: 'Be the first to know with instant breaking news notifications.' },
  { icon: Brain, label: 'AI Summaries', desc: 'Too busy to read? Get 3-line AI summaries of any article.' },
];

const OnboardingCarousel = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#0D0D0D', '#1A0505', '#0D0D0D']}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(211,47,47,0.35)', 'transparent']}
        style={styles.topGlow}
      />

      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], paddingTop: insets.top + 40 }]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetters}>in</Text>
          </View>
          <Text style={styles.logoText}>inked.</Text>
        </View>

        <Text style={styles.headline}>Your news,{'\n'}your way.</Text>
        <Text style={styles.sub}>The smarter way to stay on top of what matters — personalised, fast, and beautifully presented.</Text>

        {/* Features */}
        <View style={styles.featureList}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon size={20} color="#D32F2F" strokeWidth={2} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[styles.ctaWrap, { opacity: fadeAnim, paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation.replace('Main')}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.ctaSub}>Free. No sign-up required.</Text>
      </Animated.View>
    </View>
  );
};

export default OnboardingCarousel;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  topGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4,
  },
  content: { flex: 1, paddingHorizontal: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoLetters: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5 },
  headline: { fontSize: 44, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, lineHeight: 50, marginBottom: 16 },
  sub: { fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 24, marginBottom: 48 },
  featureList: { gap: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(211,47,47,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(211,47,47,0.25)' },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  featureDesc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 20 },
  ctaWrap: { paddingHorizontal: 28, alignItems: 'center' },
  ctaButton: { width: '100%', backgroundColor: '#D32F2F', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 14 },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  ctaSub: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
});
