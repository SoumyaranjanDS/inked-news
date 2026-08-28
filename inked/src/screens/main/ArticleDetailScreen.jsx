import React, { useState, useMemo, useEffect } from 'react';
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
  Share as NativeShare,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  MoreVertical,
  Heart,
  MessageCircle,
  Bookmark,
  Sparkles,
  ExternalLink,
  Newspaper,
  TrendingUp,
} from 'lucide-react-native';
import { OPTIMIZER_URL, MAIN_BACKEND_URL, safeFetch } from '../../config/api';
import { SkeletonBox } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const getRealSource = item => {
  let src = item.source || 'Inked Wire';
  if (src.length <= 3 || src.toLowerCase() === 'in') {
    const parts = item.headline ? item.headline.split(' - ') : [];
    if (parts.length > 1) {
      src = parts[parts.length - 1].trim();
    } else {
      src = 'Inked Wire';
    }
  }
  return src;
};

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const { toggleBookmark, toggleLike, isBookmarked, isLiked } = useAuth();
  const saved = isBookmarked(article);
  const liked = isLiked(article.headline);

  const sourceName = getRealSource(article);
  const rawContent =
    article.detailed_description ||
    article.description ||
    article.summary ||
    'Complete news dispatch report. The editorial wire has verified and processed this breaking story for global coverage.';

  const [content, setContent] = useState(rawContent);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  // Related Stories feed state
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Interactive Floating Pill State
  const [likes, setLikes] = useState(article.likes || 2500);
  const [saves, setSaves] = useState(700);
  const commentsCount = article.comments || 1900;

  const handleLike = () => {
    toggleLike(article.headline);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleSave = () => {
    toggleBookmark(article);
    setSaves(prev => (saved ? prev - 1 : prev + 1));
  };
  useEffect(() => {
    let isMounted = true;
    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const res = await safeFetch('/api/feed?limit=12&page=1');
        const data = await res.json();
        if (data.success && isMounted) {
          const filtered = (data.data || [])
            .filter(
              a =>
                a._id !== article._id &&
                a.headline?.toLowerCase() !== article.headline?.toLowerCase(),
            )
            .slice(0, 5);
          setRelatedArticles(filtered);
        }
      } catch (err) {
        console.log('Error fetching related feed:', err);
      } finally {
        if (isMounted) setLoadingRelated(false);
      }
    };

    fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [article._id, article.headline]);

  const handleShare = () => {
    NativeShare.share({
      title: article.headline,
      message: `${article.headline}\n\nRead more on Inked News: ${
        article.link || 'https://inkedfact.online'
      }`,
    }).catch(err => console.log('Share error:', err));
  };

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
          text: content,
        }),
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

  // Calculate estimated reading time
  const readingTime = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  }, [content]);

  // Format date display
  const dateDisplay = article.date || 'Today';

  // Format large numbers (e.g. 2500 -> 2.5k)
  const formatCount = count => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  };

  // Format paragraphs for rich readability
  const paragraphs = useMemo(() => {
    return content.split(/\n\n+/).filter(p => p.trim().length > 0);
  }, [content]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ── Top Navigation Bar ── */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
            borderBottomColor: isDark ? '#1F1F1F' : '#F5F5F5',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={26} color={isDark ? '#FFFFFF' : '#111113'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MoreVertical size={22} color={isDark ? '#FFFFFF' : '#111113'} />
        </TouchableOpacity>
      </View>

      {/* ── Article Content Scroll View ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 110,
        }}
      >
        {/* ── Headline Title (Above Image) ── */}
        <Text
          style={[styles.headline, { color: isDark ? '#FFFFFF' : '#111113' }]}
        >
          {article.headline}
        </Text>

        {/* ── Subtitle / Metadata Row ── */}
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.metaAuthor,
              { color: isDark ? '#8E8E93' : '#6E6E73' },
            ]}
          >
            {dateDisplay} by{' '}
            <Text
              style={[
                styles.metaAuthorBold,
                { color: isDark ? '#FFFFFF' : '#111113' },
              ]}
            >
              {sourceName}
            </Text>
          </Text>
          <Text
            style={[styles.metaTime, { color: isDark ? '#8E8E93' : '#8E8E93' }]}
          >
            {readingTime}
          </Text>
        </View>

        {/* ── Featured Image Card ── */}
        {article.image_link && /^https?:\/\//.test(article.image_link) ? (
          <View
            style={[
              styles.imageWrapper,
              { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' },
            ]}
          >
            <Image
              source={{ uri: article.image_link }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <View
            style={[
              styles.imageWrapper,
              styles.imagePlaceholder,
              { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' },
            ]}
          >
            <Text
              style={[
                styles.placeholderText,
                { color: isDark ? '#6E6E73' : '#8E8E93' },
              ]}
            >
              INKED NEWS DISPATCH
            </Text>
          </View>
        )}

        {/* ── Executive Summary Callout (If AI summarized) ── */}
        {aiSummary && (
          <View
            style={[
              styles.summaryBox,
              {
                backgroundColor: isDark ? '#1A1C19' : '#F4FBF7',
                borderColor: isDark ? '#2E4C38' : '#D1F0DE',
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <Sparkles size={16} color="#16A34A" />
              <Text style={styles.summaryTitle}>EXECUTIVE SUMMARY</Text>
            </View>
            <Text
              style={[
                styles.summaryText,
                { color: isDark ? '#E2E8F0' : '#1E293B' },
              ]}
            >
              {aiSummary}
            </Text>
          </View>
        )}

        {/* ── Article Body Paragraphs ── */}
        <View style={styles.bodyContainer}>
          {paragraphs.map((p, idx) => (
            <Text
              key={idx}
              style={[
                styles.paragraph,
                { color: isDark ? '#D1D5DB' : '#333333' },
              ]}
            >
              {p}
            </Text>
          ))}
        </View>

        {/* ── AI Optimize Trigger (If available) ── */}
        {!aiSummary && (
          <TouchableOpacity
            style={[
              styles.optimizeButton,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#F4F4F6',
                borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
              },
            ]}
            onPress={handleOptimize}
            disabled={isOptimizing}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#DC2626" />
            <Text
              style={[
                styles.optimizeButtonText,
                { color: isDark ? '#FFF' : '#111' },
              ]}
            >
              {isOptimizing
                ? 'Generating Executive Brief...'
                : 'Generate AI Key Insights'}
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Read Full Source Wire CTA ── */}
        {article.link && (
          <TouchableOpacity
            style={[
              styles.sourceLinkCta,
              {
                backgroundColor: isDark ? '#1A1A1C' : '#F9FAFB',
                borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
              },
            ]}
            onPress={handleOpenSource}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.sourceCtaTitle,
                  { color: isDark ? '#FFF' : '#111' },
                ]}
              >
                View Original Source
              </Text>
              <Text
                style={[
                  styles.sourceCtaSub,
                  { color: isDark ? '#888' : '#666' },
                ]}
              >
                Published on {sourceName}
              </Text>
            </View>
            <ExternalLink size={18} color="#DC2626" />
          </TouchableOpacity>
        )}

        {/* ── MORE ARTICLES / HORIZONTAL SLIDABLE CARDS ── */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeaderRow}>
            <View style={styles.relatedTitleGroup}>
              <TrendingUp size={16} color="#DC2626" />
              <Text
                style={[
                  styles.relatedSectionTitle,
                  { color: isDark ? '#FFF' : '#111' },
                ]}
              >
                More Stories For You
              </Text>
            </View>
            <Text style={styles.relatedBadge}>Swipe Stories →</Text>
          </View>

          {loadingRelated ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.slidableScroll}
            >
              {[1, 2, 3].map(n => (
                <View
                  key={n}
                  style={[
                    styles.slidableCard,
                    { backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA' },
                  ]}
                >
                  <SkeletonBox
                    width="100%"
                    height={230}
                    borderRadius={18}
                    isDark={isDark}
                  />
                </View>
              ))}
            </ScrollView>
          ) : relatedArticles.length > 0 ? (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.slidableScroll}
            >
              {relatedArticles.map((item, idx) => {
                const itemSrc = getRealSource(item);
                return (
                  <TouchableOpacity
                    key={item._id || idx}
                    style={styles.slidableCard}
                    activeOpacity={0.9}
                    onPress={() =>
                      navigation.push('ArticleDetail', { article: item })
                    }
                  >
                    {item.image_link && /^https?:\/\//.test(item.image_link) ? (
                      <Image
                        source={{ uri: item.image_link }}
                        style={styles.slidableImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.slidableImage,
                          { backgroundColor: isDark ? '#262628' : '#E5E7EB' },
                        ]}
                      >
                        <Newspaper
                          size={28}
                          color={isDark ? '#555' : '#999'}
                          style={{ alignSelf: 'center', marginTop: 70 }}
                        />
                      </View>
                    )}

                    {/* Dark gradient overlay for text readability */}
                    <LinearGradient
                      colors={[
                        'transparent',
                        'rgba(0,0,0,0.5)',
                        'rgba(0,0,0,0.92)',
                      ]}
                      style={styles.slidableGradient}
                    />

                    {/* Source Badge */}
                    <View style={styles.slidableBadge}>
                      <TrendingUp size={10} color="#FFF" />
                      <Text style={styles.slidableBadgeText}> {itemSrc}</Text>
                    </View>

                    {/* Text Details at bottom of card */}
                    <View style={styles.slidableContent}>
                      <Text style={styles.slidableHeadline} numberOfLines={2}>
                        {item.headline}
                      </Text>
                      <View style={styles.slidableMeta}>
                        <Text style={styles.slidableDate}>
                          {item.date || 'Today'}
                        </Text>
                        <Text style={styles.slidableDot}>•</Text>
                        <Text style={styles.slidableRead}>Read Story →</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}
        </View>
      </ScrollView>

      {/* ── FLOATING BOTTOM INTERACTION PILL ── */}
      <View
        style={[
          styles.floatingPill,
          {
            bottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        {/* Like Button */}
        <TouchableOpacity
          style={styles.pillItem}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Heart
            size={18}
            color={liked ? '#EF4444' : '#FFFFFF'}
            fill={liked ? '#EF4444' : 'transparent'}
          />
          <Text style={[styles.pillCount, liked && { color: '#EF4444' }]}>
            {formatCount(likes)}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.pillItem}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <MessageCircle size={18} color="#FFFFFF" />
          <Text style={styles.pillCount}>{formatCount(commentsCount)}</Text>
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity
          style={styles.pillItem}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Bookmark
            size={18}
            color={saved ? '#3B82F6' : '#FFFFFF'}
            fill={saved ? '#3B82F6' : 'transparent'}
          />
          <Text style={[styles.pillCount, saved && { color: '#3B82F6' }]}>
            {formatCount(saves)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArticleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metaAuthor: {
    fontSize: 13,
    fontWeight: '400',
  },
  metaAuthorBold: {
    fontWeight: '700',
  },
  metaTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  bodyContainer: {
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 15.5,
    lineHeight: 25,
    marginBottom: 16,
    fontWeight: '400',
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  optimizeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sourceLinkCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 26,
  },
  sourceCtaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceCtaSub: {
    fontSize: 12,
  },
  relatedSection: {
    marginTop: 14,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginBottom: 20,
  },
  relatedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  relatedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relatedSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  relatedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slidableScroll: {
    gap: 14,
    paddingRight: 10,
  },
  slidableCard: {
    width: width * 0.7,
    height: 230,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  slidableImage: {
    width: '100%',
    height: '100%',
  },
  slidableGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  slidableBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  slidableBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slidableContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    gap: 6,
  },
  slidableHeadline: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slidableMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slidableDate: {
    color: '#DDD',
    fontSize: 11,
    fontWeight: '400',
  },
  slidableDot: {
    color: '#AAA',
    fontSize: 11,
  },
  slidableRead: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  floatingPill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#161618',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillCount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
