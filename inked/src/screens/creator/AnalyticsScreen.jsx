import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const AnalyticsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AnalyticsScreen</Text>
      {navigation.canGoBack() && <Button title="Go Back" onPress={() => navigation.goBack()} />}
    </View>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F4EE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});
