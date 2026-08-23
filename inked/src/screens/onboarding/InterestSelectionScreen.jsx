import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const INTERESTS = [
  'Politics', 'Business', 'Technology', 'Sports',
  'Entertainment', 'Health', 'Science', 'World',
  'Environment', 'Lifestyle'
];

const InterestSelectionScreen = ({ navigation }) => {
  const [selected, setSelected] = useState([]);

  const toggleInterest = (interest) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter((item) => item !== interest));
    } else {
      setSelected([...selected, interest]);
    }
  };

  const isEnabled = selected.length === 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient 
        colors={['rgba(255,255,255,0)', 'rgba(195, 232, 210, 0.4)']}
        style={styles.glowBottom} 
      />
      <LinearGradient 
        colors={['rgba(235, 245, 240, 0.6)', 'rgba(255,255,255,0)']}
        style={styles.glowTop} 
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>What are you{'\n'}interested in?</Text>
            <Text style={styles.subtitle}>Select exactly 3 ({selected.length}/3)</Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {INTERESTS.map((interest) => {
              const isSelected = selected.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  activeOpacity={0.7}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected
                  ]}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, !isEnabled && styles.buttonDisabled]}
              disabled={!isEnabled}
              onPress={() => navigation.navigate('PersonalizedPreview', { interests: selected })}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, !isEnabled && styles.buttonTextDisabled]}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default InterestSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.2,
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
  },
  glowTop: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width,
    height: width,
    borderRadius: width * 0.5,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 20,
  },
  pill: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillUnselected: {
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  pillSelected: {
    borderColor: '#111',
    backgroundColor: '#111',
  },
  pillText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#FFF',
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
