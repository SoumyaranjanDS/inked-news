import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProfileScreen</Text>
      {navigation.canGoBack() && <Button title="Go Back" onPress={() => navigation.goBack()} />}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d60000f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
});
