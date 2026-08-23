import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, Dimensions,
  ScrollView, PanResponder, Animated, useColorScheme
} from 'react-native';
import { MAIN_BACKEND_URL } from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, Heart, MessageCircle, Eye, Share, MoreHorizontal, CheckCircle2, TrendingUp, Globe2, Bookmark } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const TREND_CARD_W = width * 0.72;
const TREND_CARD_H = 230;
const WORLD_CARD_W = width * 0.72;
const WORLD_CARD_H = 220;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const formatTime = (_, timeStr) => {
  if (timeStr) { const p = timeStr.split(':'); if (p.length >= 2) return p[0] + 'h ago'; }
  return '2h ago';
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const CATEGORIES = ['All', 'Tech', 'Business', 'Sports', 'World', 'Health'];

const TrendingCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.trendCard} activeOpacity={0.9} onPress={onPress}>
    {item.image_link ? <Image source={{ uri: item.image_link }} style={styles.trendImage} /> : <View style={[styles.trendImage, { backgroundColor: '#CCC' }]} />}
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.trendGradient} />
    <View style={styles.trendBadge}><TrendingUp size={11} color="#FFF" /><Text style={styles.trendBadgeText}> TRENDING</Text></View>
    <View style={styles.trendContent}>
      <Text style={styles.trendSource}>{item.source || 'News'}</Text>
      <Text style={styles.trendHeadline} numberOfLines={2}>{item.headline}</Text>
    </View>
  </TouchableOpacity>
);

const ArticleCard = ({ item, onPress, isDark }) => {
  const src = item.source || 'N';
  const init = src.charAt(0).toUpperCase();
  const time = formatTime(item.date, item.time);
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]} activeOpacity={0.92} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.sourceInfo}>
          <View style={styles.sourceLogo}><Text style={styles.sourceLogoText}>{init}</Text></View>
          <View>
            <View style={styles.sourceNameRow}>
              <Text style={[styles.sourceName, { color: isDark ? '#FFF' : '#111' }]}>{src}</Text>
              <CheckCircle2 size={13} color="#007AFF" fill="#E5F0FF" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.moreBtn, { backgroundColor: isDark ? '#333' : '#F7F7F7' }]}><MoreHorizontal size={18} color={isDark ? '#FFF' : '#999'} /></TouchableOpacity>
      </View>
      <Text style={[styles.cardHeadline, { color: isDark ? '#FFF' : '#111' }]} numberOfLines={3}>{item.headline}</Text>
      {item.image_link ? <Image source={{ uri: item.image_link }} style={styles.cardImage} /> : <View style={[styles.cardImage, { backgroundColor: isDark ? '#333' : '#F3F3F3' }]} />}
      <View style={styles.actionRow}>
        <View style={styles.actionGroup}>
          <View style={[styles.actionPill, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}><Heart size={14} color={isDark ? '#DDD' : '#666'} /><Text style={[styles.actionText, { color: isDark ? '#DDD' : '#555' }]}>{item.likes}</Text></View>
          <View style={[styles.actionPill, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}><MessageCircle size={14} color={isDark ? '#DDD' : '#666'} /><Text style={[styles.actionText, { color: isDark ? '#DDD' : '#555' }]}>{item.comments}</Text></View>
          <View style={[styles.actionPill, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}><Eye size={14} color={isDark ? '#DDD' : '#666'} /><Text style={[styles.actionText, { color: isDark ? '#DDD' : '#555' }]}>{item.views}</Text></View>
        </View>
        <TouchableOpacity style={[styles.sharePill, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}><Share size={14} color={isDark ? '#DDD' : '#666'} /></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const WorldCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.worldCard} activeOpacity={0.9} onPress={onPress}>
    {item.image_link ? <Image source={{ uri: item.image_link }} style={styles.worldImage} /> : <View style={[styles.worldImage, { backgroundColor: '#CCC' }]} />}
    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.88)']} style={styles.worldGradient} />
    <View style={styles.worldBadge}><Globe2 size={11} color="#FFF" /><Text style={styles.worldBadgeText}> WORLD</Text></View>
    <View style={styles.worldContent}>
      <Text style={styles.worldSource}>{item.source || 'News'}</Text>
      <Text style={styles.worldHeadline} numberOfLines={2}>{item.headline}</Text>
    </View>
  </TouchableOpacity>
);

// ForYouStack: isolated from ScrollView so vertical swipe is not stolen
const ForYouStack = ({ items, onPress, onSwipeStart, onSwipeEnd }) => {
  const [stack, setStack] = useState(items.slice(0, 8));
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const dismissTop = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -height * 0.35, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      setStack(prev => {
        if (prev.length <= 1) return prev;
        const next = prev.slice(1);
        translateY.setValue(0);
        opacity.setValue(1);
        return next;
      });
      onSwipeEnd && onSwipeEnd();
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      // Capture vertical touches BEFORE the ScrollView can
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => { onSwipeStart && onSwipeStart(); },
      onPanResponderMove: (_, g) => {
        if (g.dy < 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -50) {
          dismissTop();
        } else {
          Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true }).start();
          onSwipeEnd && onSwipeEnd();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true }).start();
        onSwipeEnd && onSwipeEnd();
      },
    })
  ).current;

  if (!stack.length) return <View style={styles.stackEmpty}><Text style={{color:'#999'}}>No more stories</Text></View>;
  const visible = stack.slice(0, 3);

  return (
    <View style={styles.stackWrap}>
      {[...visible].reverse().map((item, revIdx) => {
        const isTop = revIdx === visible.length - 1;
        const scale = 1 - revIdx * 0.04;
        const cardTopOffset = revIdx * 12;
        return (
          <Animated.View
            key={String(item._id) + revIdx}
            {...(isTop ? panResponder.panHandlers : {})}
            style={[
              styles.stackCard,
              {
                zIndex: revIdx + 1,
                transform: isTop
                  ? [{ translateY }, { scale }]
                  : [{ translateY: cardTopOffset }, { scale }],
                opacity: isTop ? opacity : 1 - revIdx * 0.1,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={0.92} onPress={() => isTop && onPress(item)} style={{ flex: 1 }}>
              {item.image_link ? <Image source={{ uri: item.image_link }} style={styles.stackImage} /> : <View style={[styles.stackImage, { backgroundColor: '#DDD' }]} />}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} style={styles.stackGradient} />
              <View style={styles.stackContent}>
                <Text style={styles.stackSource}>{item.source || 'News'}</Text>
                <Text style={styles.stackHeadline} numberOfLines={3}>{item.headline}</Text>
                <Text style={styles.stackHint}>↑  Swipe up for next</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

const SectionHeader = ({ title, icon: Icon, color = '#111', onSeeAll, isDark }) => (
  <View style={styles.sectionHead}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {Icon && <Icon size={18} color={color === '#111' && isDark ? '#FFF' : color} />}
      <Text style={[styles.sectionTitle, { color: color === '#111' && isDark ? '#FFF' : color }]}>{title}</Text>
    </View>
    {onSeeAll && <TouchableOpacity onPress={onSeeAll}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>}
  </View>
);

const HomeScreen = ({ navigation }) => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${MAIN_BACKEND_URL}/api/feed?limit=40&page=1`);
      const data = await res.json();
      if (data.success) {
        const decorated = shuffle(data.data).map(item => ({
          ...item,
          likes: getRandomInt(100, 9999),
          comments: getRandomInt(10, 999),
          views: getRandomInt(500, 50000),
        }));
        setArticles(decorated);
      }
    } catch (err) { console.error('Feed error:', err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchFeed(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchFeed(); }, []);

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0D0D0D' : '#F5F5F5' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <ActivityIndicator size="large" color="#D32F2F" />
    </View>
  );

  const trending = articles.slice(0, 6);
  const popular = articles.slice(6, 16);
  const worldNews = articles.slice(16, 22);
  const forYou = articles.slice(22, 32);
  const NAV_HEIGHT = 80 + insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F5F5F5' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" />}
        contentContainerStyle={{ paddingBottom: NAV_HEIGHT + 16, paddingTop: insets.top + 12 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerLogo}>inked.</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerIcon, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}><Bookmark size={20} color={isDark ? '#FFF' : '#111'} /></TouchableOpacity>
            <TouchableOpacity style={[styles.headerIcon, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}><Bell size={20} color={isDark ? '#FFF' : '#111'} /></TouchableOpacity>
          </View>
        </View>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={[styles.catPill, { backgroundColor: isDark ? '#1A1A1A' : '#FFF', borderColor: isDark ? '#333' : '#E8E8E8' }, activeCategory === cat && styles.catPillActive]}>
              <Text style={[styles.catText, { color: isDark ? '#AAA' : '#666' }, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TRENDING */}
        <SectionHeader title="Trending Now" icon={TrendingUp} color="#D32F2F" onSeeAll={() => {}} isDark={isDark} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {trending.map((item, i) => <TrendingCard key={item._id || i} item={item} onPress={() => navigation.navigate('ArticleDetail', { article: item })} />)}
        </ScrollView>

        {/* POPULAR */}
        <SectionHeader title="Popular News" color={isDark ? '#FFF' : '#111'} onSeeAll={() => {}} isDark={isDark} />
        {popular.slice(0, 5).map((item, i) => <ArticleCard key={item._id || i} item={item} onPress={() => navigation.navigate('ArticleDetail', { article: item })} isDark={isDark} />)}

        {/* WORLD */}
        <SectionHeader title="World News" icon={Globe2} color={isDark ? '#FFF' : '#333'} onSeeAll={() => {}} isDark={isDark} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {worldNews.map((item, i) => <WorldCard key={item._id || i} item={item} onPress={() => navigation.navigate('ArticleDetail', { article: item })} />)}
        </ScrollView>

        {/* MORE POPULAR */}
        {popular.slice(5).map((item, i) => <ArticleCard key={'p2' + (item._id || i)} item={item} onPress={() => navigation.navigate('ArticleDetail', { article: item })} isDark={isDark} />)}

        {/* FOR YOU */}
        <SectionHeader title="For You" color={isDark ? '#FFF' : '#111'} onSeeAll={() => {}} isDark={isDark} />
        <Text style={styles.forYouHint}>↑  Swipe up to explore more</Text>
        <ForYouStack
          items={forYou}
          onPress={(item) => navigation.navigate('ArticleDetail', { article: item })}
          onSwipeStart={() => setScrollEnabled(false)}
          onSwipeEnd={() => setScrollEnabled(true)}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14 },
  headerLogo: { fontSize: 34, fontWeight: '900', color: '#D32F2F', letterSpacing: -1.5 },
  headerRight: { flexDirection: 'row', gap: 10 },
  headerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  catScroll: { paddingHorizontal: 16, gap: 10, marginBottom: 22 },
  catPill: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8E8E8' },
  catPillActive: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  catText: { fontSize: 14, fontWeight: '600', color: '#666' },
  catTextActive: { color: '#FFF' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#D32F2F' },
  hScroll: { paddingLeft: 16, paddingRight: 8, gap: 14, marginBottom: 24 },
  trendCard: { width: TREND_CARD_W, height: TREND_CARD_H, borderRadius: 22, overflow: 'hidden', backgroundColor: '#DDD' },
  trendImage: { width: '100%', height: '100%', position: 'absolute' },
  trendGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: TREND_CARD_H * 0.65 },
  trendBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: '#D32F2F', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trendBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  trendContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  trendSource: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginBottom: 4 },
  trendHeadline: { fontSize: 16, fontWeight: '800', color: '#FFF', lineHeight: 22 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sourceInfo: { flexDirection: 'row', alignItems: 'center' },
  sourceLogo: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sourceLogoText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  sourceNameRow: { flexDirection: 'row', alignItems: 'center' },
  sourceName: { fontSize: 15, fontWeight: '700', color: '#111' },
  timeText: { fontSize: 12, color: '#999', marginTop: 2 },
  moreBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F7F7F7', justifyContent: 'center', alignItems: 'center' },
  cardHeadline: { fontSize: 18, fontWeight: '800', color: '#111', lineHeight: 26, marginBottom: 14, letterSpacing: -0.2 },
  cardImage: { width: '100%', height: 190, borderRadius: 16, marginBottom: 14 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionGroup: { flexDirection: 'row', gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, gap: 5 },
  actionText: { fontSize: 12, fontWeight: '600', color: '#555' },
  sharePill: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  worldCard: { width: WORLD_CARD_W, height: WORLD_CARD_H, borderRadius: 22, overflow: 'hidden', backgroundColor: '#DDD' },
  worldImage: { width: '100%', height: '100%', position: 'absolute' },
  worldGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: WORLD_CARD_H * 0.65 },
  worldBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  worldBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  worldContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  worldSource: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginBottom: 4 },
  worldHeadline: { fontSize: 16, fontWeight: '800', color: '#FFF', lineHeight: 22 },
  forYouHint: { textAlign: 'center', fontSize: 12, color: '#AAA', marginBottom: 14, letterSpacing: 0.3 },
  stackEmpty: { height: 120, justifyContent: 'center', alignItems: 'center' },
  stackWrap: { marginHorizontal: 16, height: 390, marginBottom: 24 },
  stackCard: { position: 'absolute', left: 0, right: 0, height: 350, borderRadius: 26, overflow: 'hidden', backgroundColor: '#CCC' },
  stackImage: { width: '100%', height: '100%', position: 'absolute' },
  stackGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 260 },
  stackContent: { position: 'absolute', bottom: 28, left: 22, right: 22 },
  stackSource: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginBottom: 8 },
  stackHeadline: { fontSize: 22, fontWeight: '900', color: '#FFF', lineHeight: 30, marginBottom: 16 },
  stackHint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 },
});
