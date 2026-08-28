import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  StatusBar,
  Keyboard,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Search,
  X,
  TrendingUp,
  Clock,
  ChevronRight,
  Newspaper,
  Calendar,
  Sparkles,
  Filter,
} from 'lucide-react-native';
import { MAIN_BACKEND_URL, safeFetch } from '../../config/api';
import { SkeletonBox } from '../../components/SkeletonLoader';

const TRENDING_TOPICS = [
  'Artificial Intelligence',
  'SpaceX',
  'Stock Market',
  'Technology',
  'Clean Energy',
  'Global Economy',
  'Health & Science',
];

const INITIAL_RECENT_SEARCHES = [
  'Space Exploration',
  'Semiconductors',
  'Electric Vehicles',
  'Climate Innovation',
];

const getRealSource = (item) => {
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

const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [allArticles, setAllArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);

  // Fetch full article catalog for search
  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await safeFetch('/api/feed?limit=80&page=1');
        const data = await res.json();
        if (data.success && isMounted) {
          setAllArticles(data.data || []);
        }
      } catch (err) {
        console.log('Error loading search feed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter articles based on active search query
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allArticles.filter((item) => {
      const headline = item.headline ? item.headline.toLowerCase() : '';
      const description = item.description ? item.description.toLowerCase() : '';
      const source = item.source ? item.source.toLowerCase() : '';
      const detailed = item.detailed_description ? item.detailed_description.toLowerCase() : '';

      return (
        headline.includes(query) ||
        description.includes(query) ||
        source.includes(query) ||
        detailed.includes(query)
      );
    });
  }, [searchQuery, allArticles]);

  // Navigate back to Home tab when Android hardware back is pressed
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (searchQuery.trim().length > 0) {
          setSearchQuery('');
          return true;
        }
        navigation.navigate('Home');
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, searchQuery])
  );

  const handleSelectTopic = (topic) => {
    setSearchQuery(topic);
    addRecentSearch(topic);
    Keyboard.dismiss();
  };

  const addRecentSearch = (term) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 6);
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
  };

  const handleArticlePress = (item) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
    navigation.navigate('ArticleDetail', { article: item });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8', paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      {/* ── Header & Search Input Bar ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>Discover</Text>
          <View style={styles.liveBadge}>
            <Sparkles size={11} color="#DC2626" />
            <Text style={styles.liveBadgeText}>Live Wire</Text>
          </View>
        </View>

        <View style={[styles.searchBarContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
          <Search size={18} color={isDark ? '#8E8E93' : '#8E8E93'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFF' : '#111' }]}
            placeholder="Search stories, topics, or sources..."
            placeholderTextColor={isDark ? '#636366' : '#8E8E93'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => addRecentSearch(searchQuery)}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color={isDark ? '#AAA' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Main Body (Search Results OR Discovery Hub) ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        keyboardShouldPersistTaps="handled"
      >
        {searchQuery.trim().length > 0 ? (
          /* ── ACTIVE SEARCH RESULTS ── */
          <View style={styles.resultsContainer}>
            {/* Results Count Bar */}
            <View style={styles.resultsCountBar}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Filter size={13} color="#DC2626" />
                <Text style={[styles.resultsCountText, { color: isDark ? '#CCC' : '#555' }]}>
                  Found <Text style={{ fontWeight: '700', color: isDark ? '#FFF' : '#111' }}>{searchResults.length}</Text> stories for "{searchQuery}"
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Results List */}
            {searchResults.length > 0 ? (
              <View style={{ gap: 12 }}>
                {searchResults.map((item, idx) => {
                  const itemSrc = getRealSource(item);
                  return (
                    <TouchableOpacity
                      key={item._id || idx}
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: isDark ? '#161618' : '#FFFFFF',
                          borderColor: isDark ? '#262628' : '#F0F0F0',
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleArticlePress(item)}
                    >
                      <View style={styles.resultCardContent}>
                        <View style={styles.resultMetaRow}>
                          <Text style={styles.resultSourceTag}>{itemSrc}</Text>
                          <Text style={styles.resultDot}>•</Text>
                          <Text style={styles.resultTimeText}>{item.date || 'Today'}</Text>
                        </View>
                        <Text
                          style={[
                            styles.resultHeadline,
                            { color: isDark ? '#FFFFFF' : '#111113' },
                          ]}
                          numberOfLines={2}
                        >
                          {item.headline}
                        </Text>
                      </View>

                      {item.image_link && /^https?:\/\//.test(item.image_link) ? (
                        <Image
                          source={{ uri: item.image_link }}
                          style={styles.resultImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.resultImage,
                            styles.resultImagePlaceholder,
                            { backgroundColor: isDark ? '#222' : '#F3F4F6' },
                          ]}
                        >
                          <Newspaper size={20} color={isDark ? '#666' : '#999'} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* No Results Empty State */
              <View style={[styles.emptyState, { backgroundColor: isDark ? '#161618' : '#FFFFFF', borderColor: isDark ? '#262628' : '#EAEAEA' }]}>
                <Newspaper size={36} color={isDark ? '#666' : '#999'} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#111' }]}>No matches found</Text>
                <Text style={[styles.emptySubtitle, { color: isDark ? '#AAA' : '#666' }]}>
                  We couldn't find any articles matching "{searchQuery}". Try searching for another topic or source.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.emptyActionText}>Show Trending Topics</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* ── DEFAULT DISCOVERY HUB (Trending + Recents) ── */
          <View>
            {/* Trending Topics */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color="#DC2626" />
                <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Trending Topics</Text>
              </View>
              <View style={styles.chipsContainer}>
                {TRENDING_TOPICS.map((topic, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectTopic(topic)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: isDark ? '#EEE' : '#333' }]}>{topic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Clock size={16} color={isDark ? '#8E8E93' : '#8E8E93'} />
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Recent Searches</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearRecent}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.recentContainer, { backgroundColor: isDark ? '#161618' : '#FFFFFF', borderColor: isDark ? '#262628' : '#EAEAEA' }]}>
                  {recentSearches.map((search, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectTopic(search)}
                      style={[
                        styles.recentItem,
                        { borderBottomColor: isDark ? '#222224' : '#F3F4F6' },
                        idx === recentSearches.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Clock size={14} color={isDark ? '#666' : '#999'} />
                        <Text style={[styles.recentText, { color: isDark ? '#DDD' : '#333' }]}>{search}</Text>
                      </View>
                      <ChevronRight size={16} color={isDark ? '#555' : '#CCC'} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Latest Featured Feed Preview */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Calendar size={16} color={isDark ? '#8E8E93' : '#8E8E93'} />
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Latest Across Categories</Text>
                </View>
              </View>

              {isLoading ? (
                <View style={{ gap: 12 }}>
                  {[1, 2, 3].map((n) => (
                    <View
                      key={n}
                      style={[
                        styles.resultCard,
                        { backgroundColor: isDark ? '#161618' : '#FFFFFF', borderColor: isDark ? '#262628' : '#F0F0F0' },
                      ]}
                    >
                      <View style={{ flex: 1, gap: 8 }}>
                        <SkeletonBox width={70} height={12} borderRadius={4} isDark={isDark} />
                        <SkeletonBox width="95%" height={15} borderRadius={4} isDark={isDark} />
                        <SkeletonBox width="60%" height={15} borderRadius={4} isDark={isDark} />
                      </View>
                      <SkeletonBox width={76} height={76} borderRadius={12} isDark={isDark} />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {allArticles.slice(0, 5).map((item, idx) => {
                    const itemSrc = getRealSource(item);
                    return (
                      <TouchableOpacity
                        key={item._id || idx}
                        style={[
                          styles.resultCard,
                          {
                            backgroundColor: isDark ? '#161618' : '#FFFFFF',
                            borderColor: isDark ? '#262628' : '#F0F0F0',
                          },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => handleArticlePress(item)}
                      >
                        <View style={styles.resultCardContent}>
                          <View style={styles.resultMetaRow}>
                            <Text style={styles.resultSourceTag}>{itemSrc}</Text>
                            <Text style={styles.resultDot}>•</Text>
                            <Text style={styles.resultTimeText}>{item.date || 'Today'}</Text>
                          </View>
                          <Text
                            style={[
                              styles.resultHeadline,
                              { color: isDark ? '#FFFFFF' : '#111113' },
                            ]}
                            numberOfLines={2}
                          >
                            {item.headline}
                          </Text>
                        </View>

                        {item.image_link && /^https?:\/\//.test(item.image_link) ? (
                          <Image
                            source={{ uri: item.image_link }}
                            style={styles.resultImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.resultImage,
                              styles.resultImagePlaceholder,
                              { backgroundColor: isDark ? '#222' : '#F3F4F6' },
                            ]}
                          >
                            <Newspaper size={20} color={isDark ? '#666' : '#999'} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  liveBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    fontWeight: '400',
  },
  clearBtn: {
    padding: 6,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  resultsCountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultsCountText: {
    fontSize: 13,
  },
  clearFilterText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  resultCardContent: {
    flex: 1,
    gap: 4,
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultSourceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  resultDot: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  resultTimeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  resultHeadline: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  resultImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  resultImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyActionBtn: {
    backgroundColor: '#111113',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  recentContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  recentText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
