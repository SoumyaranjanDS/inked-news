import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MAIN_BACKEND_URL } from '@env';

// Removing MOCK_NEWS as we will fetch real news

const PersonalizedPreviewScreen = ({ route, navigation }) => {
  const { interests = [] } = route.params || {};
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (interests.length > 0) {
      const query = interests.join(',');
      fetch(`${MAIN_BACKEND_URL}/api/interests?topics=${query}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setArticles(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [interests]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your personalized{'\n'}news preview</Text>
          <Text style={styles.subtitle}>We've picked some stories based on your interests.</Text>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#111" style={{ marginTop: 50 }} />
          ) : (
            articles.map((news) => (
              <View key={news._id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={3}>{news.headline}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.categoryText}>{news.matched_category || news.source}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.timeText}>{news.time || 'Today'}</Text>
                  </View>
                </View>
                {news.image_link && (
                  <Image source={{ uri: news.image_link }} style={styles.cardImage} />
                )}
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.replace('Main')}
          >
            <Text style={styles.buttonText}>Looks Good!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PersonalizedPreviewScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 24,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    lineHeight: 24,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C1272D', // strict red
    textTransform: 'uppercase',
  },
  dot: {
    marginHorizontal: 6,
    color: '#999',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#F7F4EE', // same as background to blend
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
