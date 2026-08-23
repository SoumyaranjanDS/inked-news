import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share, ThumbsUp, MoreVertical, Sparkles } from 'lucide-react-native';
import { OPTIMIZER_URL } from '@env';

const { width } = Dimensions.get('window');

const CATEGORY_MAP = {
  'The Hindu': 'ENTERTAINMENT',
  'Reuters': 'BUSINESS',
  'TechCrunch': 'TECHNOLOGY',
  'DEFAULT': 'NEWS'
};

const formatTime = (dateStr, timeStr) => {
  return '10 May 2025, 01 pm'; // Faking this to exactly match the mockup for style purposes
};

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  let sourceName = article.source || 'News';
  if (sourceName.length <= 3 || sourceName.toLowerCase() === 'in') {
    const parts = article.headline ? article.headline.split(' - ') : [];
    if (parts.length > 1) {
      sourceName = parts[parts.length - 1].trim();
    } else {
      sourceName = 'News';
    }
  }
  const sourceInitial = sourceName.charAt(0).toUpperCase();
  const publishDate = formatTime(article.date, article.time);
  
  const initialContent = article.detailed_description || article.description || article.summary || 'No full content available for this article.';

  const [content, setContent] = useState(initialContent);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const handleOpenSource = () => {
    if (article.link) {
      Linking.openURL(article.link).catch(err =>
        console.error('Error opening link:', err),
      );
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch(`${OPTIMIZER_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headline: article.headline,
          text: content
        })
      });
      const result = await response.json();
      
      if (result.success && result.data && result.data.summary) {
        setAiSummary(result.data.summary);
      } else {
        console.error('Failed to optimize:', result.error);
      }
    } catch (err) {
      console.error('Error calling optimize API:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header Image Area */}
        <View style={[styles.imageContainer, { backgroundColor: isDark ? '#1A1A1A' : '#EAE6DF' }]}>
          {article.image_link ? (
            <Image
              source={{ uri: article.image_link }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
          )}

          {/* Top Navigation */}
          <View style={[styles.headerActions, { top: Math.max(insets.top, 20) }]}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={{flexDirection: 'row', gap: 12}}>
              <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
                <MoreVertical size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.imageBottomCurve, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8' }]} />
        </View>

        {/* Content Area overlapping image slightly */}
        <View style={[styles.contentContainer, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8' }]}>
          
          {/* Floating Source Header */}
          <View style={[styles.sourceRow, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
            <View style={styles.sourceLeft}>
              <View style={styles.sourceLogo}>
                <Text style={styles.sourceLogoText}>{sourceInitial}</Text>
              </View>
              <View>
                <Text style={[styles.sourceName, { color: isDark ? '#FFF' : '#111' }]}>{sourceName}</Text>
                <Text style={[styles.timeText, { color: isDark ? '#AAA' : '#888' }]}>{publishDate}</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.shareButton, { borderColor: isDark ? '#333' : '#EAEAEA' }]}>
              <Share size={20} color={isDark ? '#FFF' : '#111'} />
            </TouchableOpacity>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: isDark ? '#FFF' : '#111' }]}>{article.headline}</Text>

          {/* Meta Information Bar */}
          <View style={[styles.metaInfoBar, { borderColor: isDark ? '#333' : '#EAEAEA' }]}>
            <Text style={[styles.metaText, { color: isDark ? '#AAA' : '#666' }]}>Source:</Text>
            <Text style={[styles.metaTextBold, { color: isDark ? '#FFF' : '#111' }]}>{sourceName}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <ThumbsUp size={16} color={isDark ? '#AAA' : '#666'} style={{marginRight: 6}}/>
              <Text style={[styles.metaText, { color: isDark ? '#AAA' : '#666' }]}>10k liked</Text>
            </View>
          </View>

          {/* AI Optimize Button */}
          {!aiSummary && (
            <TouchableOpacity 
              style={[styles.aiButton, { backgroundColor: isDark ? '#162b1f' : '#EAF6EE', borderColor: isDark ? '#1d422b' : '#C3E8D2' }]} 
              onPress={handleOptimize}
              disabled={isOptimizing}
              activeOpacity={0.7}
            >
              {isOptimizing ? (
                <ActivityIndicator size="small" color={isDark ? '#FFF' : '#111'} style={styles.aiIcon} />
              ) : (
                <Sparkles size={20} color={isDark ? '#FFF' : '#111'} style={styles.aiIcon} />
              )}
              <Text style={[styles.aiButtonText, { color: isDark ? '#FFF' : '#111' }]}>
                {isOptimizing ? "Generating AI Summary..." : "Summarize with AI"}
              </Text>
            </TouchableOpacity>
          )}

          {/* AI Summary Card */}
          {aiSummary && (
            <View style={[styles.aiSummaryCard, { backgroundColor: isDark ? '#162b1f' : '#EAF6EE', borderColor: isDark ? '#1d422b' : '#C3E8D2' }]}>
              <View style={styles.aiSummaryHeader}>
                <Sparkles size={18} color="#00C853" style={styles.summarizedBadgeIcon} />
                <Text style={styles.summarizedBadgeText}>AI Summary</Text>
              </View>
              <Text style={[styles.aiSummaryText, { color: isDark ? '#DDD' : '#333' }]}>{aiSummary}</Text>
            </View>
          )}

          <Text style={[styles.summaryText, { color: isDark ? '#DDD' : '#333' }]}>
            {content}
          </Text>

          {article.link && (
            <TouchableOpacity
              style={[styles.readMoreBtn, { backgroundColor: isDark ? '#FFF' : '#111' }]}
              onPress={handleOpenSource}
              activeOpacity={0.8}
            >
              <Text style={[styles.readMoreText, { color: isDark ? '#111' : '#FFF' }]}>Read Full Article</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ArticleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  imageContainer: {
    width: '100%',
    height: width * 1.2, 
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#E5E5E5',
  },
  imageBottomCurve: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#F7F9F8',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  headerActions: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentContainer: {
    paddingHorizontal: 24,
    backgroundColor: '#F7F9F8',
    marginTop: -20, // Overlap the curved image bottom
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginTop: -40, // Float over the curve
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sourceLogoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  timeText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  publishDate: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    marginBottom: 16,
  },
  metaInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 32,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  metaTextBold: {
    fontSize: 14,
    color: '#111',
    fontWeight: '800',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF6EE', // Mint green background
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C3E8D2',
  },
  aiIcon: {
    marginRight: 8,
  },
  aiButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  aiSummaryCard: {
    backgroundColor: '#EAF6EE',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#C3E8D2',
  },
  aiSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summarizedBadgeIcon: {
    marginRight: 8,
  },
  summarizedBadgeText: {
    color: '#00C853', // Emerald green text
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  aiSummaryText: {
    fontSize: 17,
    color: '#333',
    lineHeight: 28,
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 30,
    letterSpacing: 0.2,
    marginBottom: 40,
  },
  readMoreBtn: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  readMoreText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
