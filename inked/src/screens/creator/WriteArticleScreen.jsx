import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const WriteArticleScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WriteArticleScreen</Text>
      {navigation.canGoBack() && <Button title="Go Back" onPress={() => navigation.goBack()} />}
    </View>
  );
};

export default WriteArticleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F4EE' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});
