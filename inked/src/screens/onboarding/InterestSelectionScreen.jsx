import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>What are you{'\n'}interested in?</Text>
          <Text style={styles.subtitle}>Select exactly 3 ({selected.length}/3)</Text>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
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
                <Text style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
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
          >
            <Text style={[styles.buttonText, !isEnabled && styles.buttonTextDisabled]}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InterestSelectionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  container: {
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
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
  },
  pillUnselected: {
    borderColor: '#CCC',
    backgroundColor: 'transparent',
  },
  pillSelected: {
    borderColor: '#111',
    backgroundColor: '#111',
  },
  pillText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
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
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
