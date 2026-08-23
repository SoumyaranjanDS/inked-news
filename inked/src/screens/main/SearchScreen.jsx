import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, TrendingUp, Clock, ChevronRight } from 'lucide-react-native';

const TRENDING_TOPICS = ['AI Technology', 'Stock Market', 'Electric Vehicles', 'SpaceX', 'Global Politics'];
const RECENT_SEARCHES = ['Apple Vision Pro', 'Elections 2024', 'Climate Change', 'Interest Rates'];

const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8', paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header & Search Bar */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>Discover</Text>
        <View style={[styles.searchBarContainer, { backgroundColor: isDark ? '#1A1A1A' : '#EAEAEA' }]}>
          <Search size={20} color={isDark ? '#888' : '#999'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFF' : '#111' }]}
            placeholder="Search topics, sources, or articles..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={18} color={isDark ? '#888' : '#999'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Trending Topics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#D32F2F" />
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Trending Now</Text>
          </View>
          <View style={styles.chipsContainer}>
            {TRENDING_TOPICS.map((topic, idx) => (
              <TouchableOpacity key={idx} style={[styles.chip, { backgroundColor: isDark ? '#1A1A1A' : '#EAEAEA' }]}>
                <Text style={[styles.chipText, { color: isDark ? '#CCC' : '#333' }]}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Searches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color={isDark ? '#888' : '#999'} />
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>Recent Searches</Text>
          </View>
          <View style={styles.recentContainer}>
            {RECENT_SEARCHES.map((search, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.recentItem, { borderBottomColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}
              >
                <Text style={[styles.recentText, { color: isDark ? '#CCC' : '#444' }]}>{search}</Text>
                <ChevronRight size={16} color={isDark ? '#444' : '#CCC'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearBtn: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentContainer: {
    marginTop: 4,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  recentText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
