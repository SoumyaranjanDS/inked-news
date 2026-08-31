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
  DeviceEventEmitter,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Sparkles,
  ExternalLink,
  Newspaper,
  TrendingUp,
  Share2,
} from 'lucide-react-native';
import { OPTIMIZER_URL, safeFetch } from '../../config/api';
import { SkeletonBox } from '../../components/SkeletonLoader';
import CommentsSheet from '../../components/CommentsSheet';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

const getRealSource = item => {
  let src = item.source || 'NewsOnTip Wire';
  if (src.length <= 3 || src.toLowerCase() === 'in') {
    const parts = item.headline ? item.headline.split(' - ') : [];
    if (parts.length > 1) {
      src = parts[parts.length - 1].trim();
    } else {
      src = 'NewsOnTip Wire';
    }
  }
  return src;
};

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article } = route.params;
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const { toggleBookmark, toggleLike, isBookmarked, isLiked, user } = useAuth();
  const saved =
    user?.savedArticles?.includes(article._id) || isBookmarked(article);
  const liked =
    user?.likedArticles?.includes(article._id) || isLiked(article.headline);

  const sourceName = getRealSource(article);
  const rawContent =
    article.detailed_description ||
    article.description ||
    article.summary ||
    'Complete news dispatch report. The editorial wire has verified and processed this breaking story for global coverage.';

  const [content] = useState(rawContent);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const [likes, setLikes] = useState(article.likes || 0);
  const [saves, setSaves] = useState(article.saveCount || 0);
  const [shares, setShares] = useState(article.shares || 0);
  const [commentsCount, setCommentsCount] = useState(article.comments?.length || 0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('ArticleUpdated', (data) => {
      if (data.articleId === article._id || data.articleId === article.headline) {
        if (data.type === 'like') {
          setLikes(prev => Math.max(0, prev + data.delta));
        } else if (data.type === 'save') {
          setSaves(prev => Math.max(0, prev + data.delta));
        } else if (data.type === 'comment') {
          setCommentsCount(prev => prev + data.delta);
        }
      }
    });
    return () => sub.remove();
  }, [article._id, article.headline]);

  const handleLike = async () => {
    if (!user) return navigation.navigate('AuthModal', { pendingAction: { type: 'like', article } });
    toggleLike(article);
  };

  const handleSave = async () => {
    if (!user) return navigation.navigate('AuthModal', { pendingAction: { type: 'save', article } });
    toggleBookmark(article);
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
    
    const fetchFreshArticle = async () => {
      try {
        const res = await safeFetch(`/api/article/${article._id}`);
        const data = await res.json();
        if (data.success && isMounted) {
          const serverLikes = data.data.likes || 0;
          const serverSaves = data.data.saveCount || 0;
          const isUserLiked = isLiked(article.headline);
          const isUserSaved = isBookmarked(article);
          
          setLikes(Math.max(serverLikes, isUserLiked ? 1 : 0, likes));
          setSaves(Math.max(serverSaves, isUserSaved ? 1 : 0, saves));
          setShares(Math.max(data.data.shares || 0, shares));
          setCommentsCount(Math.max(data.data.comments?.length || 0, commentsCount));
        }
      } catch (err) {
        console.log('Error fetching fresh article:', err);
      }
    };
    
    fetchRelated();
    fetchFreshArticle();
    return () => {
      isMounted = false;
    };
  }, [article._id, article.headline]);

  const handleShare = async () => {
    try {
      await NativeShare.share({
        title: article.headline,
        message: `${article.headline}\n\nRead more on NewsOnTip: ${
          article.link || 'https://inkedfact.online'
        }`,
      });
      
      // Increment share count after a successful share dialog
      setShares(prev => prev + 1);
      await safeFetch(`/api/interactions/share/${article._id}`, {
        method: 'POST',
      });
    } catch (err) {
      console.log('Share error:', err);
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: article.headline, text: content }),
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

  const readingTime = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  }, [content]);

  const dateDisplay = article.date || 'Today';

  const formatCount = count => {
    if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    return count.toString();
  };

  const paragraphs = useMemo(() => {
    return content.split(/\n\n+/).filter(p => p.trim().length > 0);
  }, [content]);

  // Theme colors
  const bg = isDark ? '#0D0D0D' : '#FFFFFF';
  const cardBg = isDark ? '#161618' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F5F7' : '#111113';
  const textSecondary = isDark ? '#8E8E93' : '#6E6E73';
  const textBody = isDark ? '#CBCCD0' : '#3A3A3C';
  const divider = isDark ? '#2C2C2E' : '#E5E5EA';
  const barBg = isDark ? 'rgba(22,22,24,0.97)' : 'rgba(255,255,255,0.97)';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar hidden />

      {/* ── Floating Back Button ── */}
      <View style={styles.floatingBackContainer}>
        <TouchableOpacity
          style={styles.glassButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* ── Hero Image ── */}
        <View style={styles.heroContainer}>
          {article.image_link && /^https?:\/\//.test(article.image_link) ? (
            <Image
              source={{ uri: article.image_link }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.heroImage,
                styles.heroPlaceholder,
                { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' },
              ]}
            >
              <Newspaper size={56} color={isDark ? '#3A3A3C' : '#AEAEB2'} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.06)', bg]}
            locations={[0.3, 0.7, 1]}
            style={styles.heroGradient}
          />
        </View>

        {/* ── Content Card ── */}
        <View style={[styles.contentCard, { backgroundColor: cardBg }]}>
          {/* Source + Read Time */}
          <View style={styles.sourcePillRow}>
            <View
              style={[
                styles.sourcePill,
                { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
              ]}
            >
              <Text style={[styles.sourcePillText, { color: textPrimary }]}>
                {sourceName}
              </Text>
            </View>
            <Text style={[styles.readTime, { color: textSecondary }]}>
              {readingTime}
            </Text>
          </View>

          {/* Headline */}
          <Text style={[styles.headline, { color: textPrimary }]}>
            {article.headline}
          </Text>

          {/* Date */}
          <Text style={[styles.dateText, { color: textSecondary }]}>
            {dateDisplay}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* AI Executive Summary */}
          {aiSummary && (
            <View
              style={[
                styles.aiCard,
                {
                  backgroundColor: isDark ? '#162016' : '#F0FDF4',
                  borderColor: isDark ? '#2E4C38' : '#BBF7D0',
                },
              ]}
            >
              <View style={styles.aiCardHeader}>
                <Sparkles size={15} color="#16A34A" />
                <Text style={styles.aiCardTitle}>AI EXECUTIVE SUMMARY</Text>
              </View>
              <Text
                style={[
                  styles.aiCardBody,
                  { color: isDark ? '#D1FAE5' : '#14532D' },
                ]}
              >
                {aiSummary}
              </Text>
            </View>
          )}

          {/* Article Body */}
          <View style={styles.bodyContainer}>
            {paragraphs.map((p, idx) => (
              <Text key={idx} style={[styles.paragraph, { color: textBody }]}>
                {p}
              </Text>
            ))}
          </View>

          {/* Read Original Source */}
          {article.link && (
            <TouchableOpacity
              style={[styles.sourceLink, { borderColor: divider }]}
              onPress={handleOpenSource}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.sourceLinkTitle, { color: textPrimary }]}>
                  Read Original Story
                </Text>
                <Text style={[styles.sourceLinkSub, { color: textSecondary }]}>
                  Published on {sourceName}
                </Text>
              </View>
              <ExternalLink size={18} color={textSecondary} />
            </TouchableOpacity>
          )}

          {/* Divider before Related */}
          <View
            style={[styles.divider, { backgroundColor: divider, marginTop: 8 }]}
          />

          {/* Related Stories */}
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: textPrimary }]}>
              More Stories
            </Text>
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
                      height={200}
                      borderRadius={16}
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
                      {item.image_link &&
                      /^https?:\/\//.test(item.image_link) ? (
                        <Image
                          source={{ uri: item.image_link }}
                          style={styles.slidableImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.slidableImage,
                            {
                              backgroundColor: isDark ? '#262628' : '#E5E7EB',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                          ]}
                        >
                          <Newspaper
                            size={24}
                            color={isDark ? '#555' : '#999'}
                          />
                        </View>
                      )}
                      <LinearGradient
                        colors={[
                          'transparent',
                          'rgba(0,0,0,0.6)',
                          'rgba(0,0,0,0.92)',
                        ]}
                        style={styles.slidableGradient}
                      />
                      <View style={styles.slidableBadge}>
                        <Text style={styles.slidableBadgeText}>{itemSrc}</Text>
                      </View>
                      <View style={styles.slidableContent}>
                        <Text style={styles.slidableHeadline} numberOfLines={2}>
                          {item.headline}
                        </Text>
                        <Text style={styles.slidableDate}>
                          {item.date || 'Today'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* ── Floating Action Icons ── */}
      <View style={[styles.floatingPill, { backgroundColor: isDark ? 'rgba(30,30,32,0.92)' : 'rgba(255,255,255,0.92)' }]}>
        <TouchableOpacity style={styles.floatingIcon} onPress={handleLike} activeOpacity={0.7}>
          <Heart size={22} color={liked ? '#EF4444' : (isDark ? '#AAA' : '#888')} fill={liked ? '#EF4444' : 'transparent'} />
          <Text style={[styles.floatingLabel, { color: liked ? '#EF4444' : (isDark ? '#AAA' : '#888') }]}>{formatCount(likes)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingIcon} onPress={() => setShowComments(true)} activeOpacity={0.7}>
          <MessageCircle size={22} color={isDark ? '#AAA' : '#888'} />
          <Text style={[styles.floatingLabel, { color: isDark ? '#AAA' : '#888' }]}>{formatCount(commentsCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingIcon} onPress={handleSave} activeOpacity={0.7}>
          <Bookmark size={22} color={saved ? '#3B82F6' : (isDark ? '#AAA' : '#888')} fill={saved ? '#3B82F6' : 'transparent'} />
          <Text style={[styles.floatingLabel, { color: saved ? '#3B82F6' : (isDark ? '#AAA' : '#888') }]}>{formatCount(saves)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingIcon} onPress={handleShare} activeOpacity={0.7}>
          <Share2 size={22} color={isDark ? '#AAA' : '#888'} />
          <Text style={[styles.floatingLabel, { color: isDark ? '#AAA' : '#888' }]}>{formatCount(shares)}</Text>
        </TouchableOpacity>

        {!aiSummary && (
          <TouchableOpacity style={styles.floatingIcon} onPress={handleOptimize} disabled={isOptimizing} activeOpacity={0.7}>
            <Sparkles size={22} color="#16A34A" />
            <Text style={[styles.floatingLabel, { color: '#16A34A' }]}>{isOptimizing ? '...' : 'AI'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments Sheet */}
      <CommentsSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        articleId={article._id}
        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
      />
    </View>
  );
};

export default ArticleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Floating Back Button ──
  floatingBackContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // ── Hero Image ──
  heroContainer: {
    width: '100%',
    height: height * 0.38,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },

  // ── Content Card ──
  contentCard: {
    marginTop: -28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    minHeight: height * 0.6,
  },
  sourcePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sourcePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sourcePillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  readTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },

  // ── AI Summary Card ──
  aiCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aiCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 1,
  },
  aiCardBody: {
    fontSize: 14.5,
    lineHeight: 23,
    fontWeight: '500',
  },

  // ── Article Body ──
  bodyContainer: {
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    fontWeight: '400',
  },

  // ── Source Link ──
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  sourceLinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  sourceLinkSub: {
    fontSize: 12,
  },

  // ── Related Stories ──
  relatedSection: {
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 16,
  },
  slidableScroll: {
    gap: 14,
    paddingRight: 10,
  },
  slidableCard: {
    width: width * 0.68,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
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
    height: '65%',
  },
  slidableBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(220,38,38,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
    gap: 5,
  },
  slidableHeadline: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  slidableDate: {
    color: '#D1D1D6',
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Floating Action Pill ──
  floatingPill: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  floatingIcon: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 44,
  },
  floatingLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
