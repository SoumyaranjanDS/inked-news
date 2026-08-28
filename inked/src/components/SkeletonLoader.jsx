import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const TREND_CARD_W = width * 0.72;

export const SkeletonBox = ({ width: boxWidth, height: boxHeight, borderRadius = 8, style, isDark = false }) => {
  const [opacityAnim] = React.useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  const baseColor = isDark ? '#262626' : '#E5E7EB';

  return (
    <Animated.View
      style={[
        {
          width: boxWidth,
          height: boxHeight,
          borderRadius,
          backgroundColor: baseColor,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export const HomeSkeleton = ({ isDark = false, insets = { top: 0, bottom: 0 } }) => {
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 90,
      }}
    >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonBox width={90} height={28} borderRadius={6} isDark={isDark} />
        <View style={styles.headerRight}>
          <SkeletonBox width={40} height={40} borderRadius={20} isDark={isDark} />
          <SkeletonBox width={40} height={40} borderRadius={20} isDark={isDark} />
        </View>
      </View>

      {/* Category Pills Skeleton */}
      <View style={styles.catScroll}>
        {[65, 55, 75, 60, 65, 58].map((w, i) => (
          <SkeletonBox key={i} width={w} height={36} borderRadius={18} style={{ marginRight: 8 }} isDark={isDark} />
        ))}
      </View>

      {/* Trending Header */}
      <View style={styles.sectionHead}>
        <SkeletonBox width={130} height={20} borderRadius={4} isDark={isDark} />
      </View>

      {/* Trending Horizontal Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendScroll}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.trendCard, { backgroundColor: cardBg }]}>
            <SkeletonBox width="100%" height={230} borderRadius={18} isDark={isDark} />
          </View>
        ))}
      </ScrollView>

      {/* Feed Section Header */}
      <View style={styles.sectionHead}>
        <SkeletonBox width={160} height={20} borderRadius={4} isDark={isDark} />
      </View>

      {/* Article Cards Skeleton */}
      {[1, 2, 3].map((n) => (
        <View key={n} style={[styles.card, { backgroundColor: cardBg }]}>
          {/* Card Header: Avatar + Source + Time */}
          <View style={styles.cardHeader}>
            <View style={styles.sourceInfo}>
              <SkeletonBox width={36} height={36} borderRadius={18} isDark={isDark} />
              <View style={{ gap: 6, marginLeft: 10 }}>
                <SkeletonBox width={90} height={14} borderRadius={4} isDark={isDark} />
                <SkeletonBox width={50} height={10} borderRadius={3} isDark={isDark} />
              </View>
            </View>
            <SkeletonBox width={28} height={28} borderRadius={14} isDark={isDark} />
          </View>

          {/* Headline Lines */}
          <View style={{ gap: 6, marginBottom: 12 }}>
            <SkeletonBox width="96%" height={16} borderRadius={4} isDark={isDark} />
            <SkeletonBox width="75%" height={16} borderRadius={4} isDark={isDark} />
          </View>

          {/* Card Image */}
          <SkeletonBox width="100%" height={200} borderRadius={14} isDark={isDark} style={{ marginBottom: 14 }} />

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SkeletonBox width={55} height={30} borderRadius={15} isDark={isDark} />
              <SkeletonBox width={55} height={30} borderRadius={15} isDark={isDark} />
              <SkeletonBox width={55} height={30} borderRadius={15} isDark={isDark} />
            </View>
            <SkeletonBox width={34} height={30} borderRadius={15} isDark={isDark} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export const PreviewSkeleton = ({ isDark = false }) => {
  const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';

  return (
    <View style={{ gap: 14, paddingHorizontal: 16 }}>
      {[1, 2, 3, 4].map((n) => (
        <View key={n} style={[styles.previewCard, { backgroundColor: cardBg }]}>
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="95%" height={15} borderRadius={4} isDark={isDark} />
            <SkeletonBox width="70%" height={15} borderRadius={4} isDark={isDark} />
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              <SkeletonBox width={60} height={11} borderRadius={3} isDark={isDark} />
              <SkeletonBox width={45} height={11} borderRadius={3} isDark={isDark} />
            </View>
          </View>
          <SkeletonBox width={72} height={72} borderRadius={12} isDark={isDark} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  catScroll: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHead: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  trendScroll: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 24,
  },
  trendCard: {
    width: TREND_CARD_W,
    height: 230,
    borderRadius: 18,
    overflow: 'hidden',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
});
