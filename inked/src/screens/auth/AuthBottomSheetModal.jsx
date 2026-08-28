import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  ScrollView,
  useColorScheme,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Layers,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');

const ALL_TOPICS = [
  'Technology',
  'Space & Science',
  'Business & Markets',
  'Artificial Intelligence',
  'Global Politics',
  'Clean Energy',
  'Automotive & EV',
  'Entertainment',
];

const AuthBottomSheetModal = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const { loginWithGoogle, updateTopics, user } = useAuth();

  // Screen View: 'auth' | 'topics'
  const initialMode = route.params?.mode === 'topics' ? 'topics' : 'auth';
  const [view, setView] = useState(initialMode);
  const [selectedTopics, setSelectedTopics] = useState(
    user?.preferredTopics || ['Technology', 'Space & Science', 'Business & Markets']
  );
  const [isLoading, setIsLoading] = useState(false);

  // Bottom Sheet Slide Animation
  const [slideAnim] = React.useState(() => new Animated.Value(height));
  const [backdropOpacity] = React.useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, backdropOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  // One-Tap Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await loginWithGoogle();
      if (res && res.success) {
        setView('topics');
      }
    } catch (err) {
      Alert.alert('Google Sign-In', 'Could not complete sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Topic Toggle
  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length <= 1) {
        Alert.alert('Notice', 'Please keep at least one category selected.');
        return;
      }
      setSelectedTopics((prev) => prev.filter((t) => t !== topic));
    } else {
      setSelectedTopics((prev) => [...prev, topic]);
    }
  };

  const handleSaveTopics = () => {
    updateTopics(selectedTopics);
    handleClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            backgroundColor: isDark ? '#161618' : '#FFFFFF',
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Sheet Drag Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.sheetTitle, { color: isDark ? '#FFF' : '#111' }]}>
            {view === 'auth' ? 'Welcome to Inked' : 'Personalize Your Wire'}
          </Text>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#262628' : '#F3F4F6' }]}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={isDark ? '#CCC' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* ── VIEW 1: ONE-TAP GOOGLE AUTH VIEW ── */}
        {view === 'auth' && (
          <View style={{ paddingTop: 4 }}>
            <Text style={[styles.sheetSubtitle, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
              Sign in with your Google account to sync your saved bookmarks, tune your news categories, and unlock creator features.
            </Text>

            {/* Feature Highlights */}
            <View style={styles.perksContainer}>
              <View style={styles.perkRow}>
                <View style={[styles.perkIconBox, { backgroundColor: isDark ? '#261E1E' : '#FEF2F2' }]}>
                  <Sparkles size={14} color="#DC2626" />
                </View>
                <Text style={[styles.perkText, { color: isDark ? '#DDD' : '#333' }]}>
                  Curated AI news summaries and executive briefings
                </Text>
              </View>

              <View style={styles.perkRow}>
                <View style={[styles.perkIconBox, { backgroundColor: isDark ? '#261E1E' : '#FEF2F2' }]}>
                  <Layers size={14} color="#DC2626" />
                </View>
                <Text style={[styles.perkText, { color: isDark ? '#DDD' : '#333' }]}>
                  Cross-device bookmark syncing and topic customizer
                </Text>
              </View>
            </View>

            {/* One-Tap Google Sign-In Button */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : '#111113',
                },
              ]}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={isDark ? '#111' : '#FFF'} />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                    style={styles.googleIcon}
                  />
                  <Text
                    style={[
                      styles.googleButtonText,
                      { color: isDark ? '#111113' : '#FFFFFF' },
                    ]}
                  >
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNoteRow}>
              <ShieldCheck size={14} color="#16A34A" />
              <Text style={[styles.privacyNote, { color: isDark ? '#666' : '#888' }]}>
                One-tap secure Google authentication. No passwords needed.
              </Text>
            </View>
          </View>
        )}

        {/* ── VIEW 2: TOPIC SELECTION / PREFERENCES ── */}
        {view === 'topics' && (
          <View style={{ paddingTop: 4 }}>
            <Text style={[styles.sheetSubtitle, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
              Select the categories you want prioritized in your wire:
            </Text>

            <ScrollView style={{ maxHeight: 280, marginVertical: 14 }}>
              <View style={{ gap: 8 }}>
                {ALL_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <TouchableOpacity
                      key={topic}
                      style={[
                        styles.topicRow,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? '#2E1515' : '#FEF2F2')
                            : (isDark ? '#222224' : '#F8F9FA'),
                          borderColor: isSelected
                            ? '#DC2626'
                            : (isDark ? '#333336' : '#E5E5EA'),
                        },
                      ]}
                      onPress={() => toggleTopic(topic)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={14} color={isSelected ? '#DC2626' : '#888'} />
                        <Text
                          style={[
                            styles.topicRowText,
                            { color: isSelected ? '#DC2626' : (isDark ? '#DDD' : '#333') },
                            isSelected && { fontWeight: '700' },
                          ]}
                        >
                          {topic}
                        </Text>
                      </View>
                      {isSelected && <Check size={18} color="#DC2626" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.primaryActionBtn} onPress={handleSaveTopics}>
              <Text style={styles.primaryActionBtnText}>Save Preferences & Continue →</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default AuthBottomSheetModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#999999',
    alignSelf: 'center',
    marginBottom: 14,
    opacity: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perksContainer: {
    gap: 10,
    marginVertical: 18,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perkIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 4,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  privacyNote: {
    fontSize: 12,
  },
  primaryActionBtn: {
    backgroundColor: '#DC2626',
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryActionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  topicRowText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
