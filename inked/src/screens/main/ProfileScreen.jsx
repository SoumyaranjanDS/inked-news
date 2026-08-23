import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle, Info, ChevronRight, LogIn } from 'lucide-react-native';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const menuItems = [
    { icon: Settings, title: 'Settings' },
    { icon: HelpCircle, title: 'Help & Support' },
    { icon: Info, title: 'About inked.' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8', paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>Profile</Text>
        </View>

        {/* Guest Info Section */}
        <View style={styles.guestSection}>
          <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#1A1A1A' : '#EAEAEA' }]}>
            <User size={40} color={isDark ? '#666' : '#999'} />
          </View>
          <Text style={[styles.guestName, { color: isDark ? '#FFF' : '#111' }]}>Guest User</Text>
          <Text style={[styles.guestSubtitle, { color: isDark ? '#AAA' : '#666' }]}>
            Sign in to save your favorite articles, sync preferences, and personalize your feed.
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, { backgroundColor: isDark ? '#FFF' : '#111' }]}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconPlaceholder}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                style={styles.googleLogoImage}
              />
            </View>
            <Text style={[styles.googleBtnText, { color: isDark ? '#111' : '#FFF' }]}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.emailButton, { borderColor: isDark ? '#333' : '#EAEAEA' }]}
            activeOpacity={0.8}
          >
            <LogIn size={20} color={isDark ? '#FFF' : '#111'} style={styles.emailIcon} />
            <Text style={[styles.emailBtnText, { color: isDark ? '#FFF' : '#111' }]}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: isDark ? '#222' : '#EAEAEA' }]} />

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.menuItem, { borderBottomColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#1A1A1A' : '#F0F0F0' }]}>
                    <Icon size={20} color={isDark ? '#FFF' : '#111'} />
                  </View>
                  <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#111' }]}>{item.title}</Text>
                </View>
                <ChevronRight size={20} color={isDark ? '#444' : '#CCC'} />
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  guestSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  authContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  googleIconPlaceholder: {
    marginRight: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  emailIcon: {
    marginRight: 10,
  },
  emailBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  googleLogoImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  }
});
