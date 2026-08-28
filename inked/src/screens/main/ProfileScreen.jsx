import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  ChevronRight,
  LogIn,
  LogOut,
  Bookmark,
  Heart,
  Sparkles,
  Layers,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Info,
  Mail,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const {
    user,
    isAuthenticated,
    savedArticles,
    likedArticles,
    logout,
    loginWithGoogle,
  } = useAuth();
  const userTopics = user?.preferredTopics || ['Technology', 'Space & Science', 'Business & Markets'];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Inked News?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0D0D0D' : '#F7F9F8', paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#111' }]}>
            {isAuthenticated ? 'My Account' : 'Profile'}
          </Text>
        </View>

        {isAuthenticated && user ? (
          /* ── AUTHENTICATED USER PROFILE ── */
          <View>
            {/* User Info Card */}
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: isDark ? '#161618' : '#FFFFFF',
                  borderColor: isDark ? '#262628' : '#EAEAEA',
                },
              ]}
            >
              <View style={styles.profileHeader}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: '#DC2626' }]}>
                    <Text style={styles.avatarInitial}>
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View style={styles.profileMeta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.userName, { color: isDark ? '#FFF' : '#111' }]}>
                      {user.name}
                    </Text>
                    <CheckCircle2 size={16} color="#007AFF" fill="#E5F0FF" />
                  </View>
                  <Text style={[styles.userEmail, { color: isDark ? '#8E8E93' : '#6B7280' }]}>
                    {user.email}
                  </Text>
                  <View style={styles.memberBadge}>
                    <ShieldCheck size={12} color="#16A34A" />
                    <Text style={styles.memberBadgeText}>Verified Reader</Text>
                  </View>
                </View>
              </View>

              {/* Stats Bar */}
              <View style={[styles.statsRow, { borderTopColor: isDark ? '#222' : '#F0F0F0' }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111' }]}>
                    {savedArticles.length}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Bookmark size={12} color="#DC2626" />
                    <Text style={styles.statLabel}>Saved</Text>
                  </View>
                </View>

                <View style={[styles.statDivider, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111' }]}>
                    {likedArticles.length}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Heart size={12} color="#DC2626" />
                    <Text style={styles.statLabel}>Liked</Text>
                  </View>
                </View>

                <View style={[styles.statDivider, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#111' }]}>
                    {userTopics.length}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Layers size={12} color="#DC2626" />
                    <Text style={styles.statLabel}>Topics</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* My Saved Stories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Bookmark size={16} color="#DC2626" />
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>
                    Saved Articles ({savedArticles.length})
                  </Text>
                </View>
              </View>

              {savedArticles.length > 0 ? (
                <View style={{ gap: 10, marginTop: 10 }}>
                  {savedArticles.slice(0, 4).map((item, idx) => (
                    <TouchableOpacity
                      key={item._id || item.link || idx}
                      style={[
                        styles.savedCard,
                        {
                          backgroundColor: isDark ? '#161618' : '#FFFFFF',
                          borderColor: isDark ? '#262628' : '#F0F0F0',
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.savedSource}>{item.source || 'Inked News'}</Text>
                        <Text
                          style={[
                            styles.savedHeadline,
                            { color: isDark ? '#FFFFFF' : '#111113' },
                          ]}
                          numberOfLines={2}
                        >
                          {item.headline}
                        </Text>
                      </View>
                      {item.image_link && (
                        <Image
                          source={{ uri: item.image_link }}
                          style={styles.savedImage}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.noSavedBox,
                    {
                      backgroundColor: isDark ? '#161618' : '#FFFFFF',
                      borderColor: isDark ? '#262628' : '#EAEAEA',
                    },
                  ]}
                >
                  <Bookmark size={24} color={isDark ? '#555' : '#BBB'} />
                  <Text style={[styles.noSavedText, { color: isDark ? '#AAA' : '#666' }]}>
                    No saved articles yet. Tap the bookmark ribbon on any story to save it for later.
                  </Text>
                </View>
              )}
            </View>

            {/* Topic Preferences Customizer */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sliders size={16} color="#DC2626" />
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>
                    Personalized Topics
                  </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('AuthModal', { mode: 'topics' })}>
                  <Text style={styles.editTopicsLink}>Customize</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.topicPillsWrap}>
                {userTopics.map((topic, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.topicPill,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                      },
                    ]}
                  >
                    <Sparkles size={12} color="#DC2626" />
                    <Text style={[styles.topicPillText, { color: isDark ? '#EEE' : '#333' }]}>
                      {topic}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Creator Studio & Support */}
            <View style={styles.section}>
              <View style={[styles.menuContainer, { backgroundColor: isDark ? '#161618' : '#FFFFFF', borderColor: isDark ? '#262628' : '#EAEAEA' }]}>
                {/* Creator Studio */}
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: isDark ? '#222224' : '#F3F4F6' }]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('CreatorDashboard')}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#222' : '#FEF2F2' }]}>
                      <Edit3 size={18} color="#DC2626" />
                    </View>
                    <View>
                      <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#111' }]}>
                        Creator Studio
                      </Text>
                      <Text style={styles.menuSubtitle}>Write articles & manage publications</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#555' : '#CCC'} />
                </TouchableOpacity>

                {/* Help & Support */}
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: isDark ? '#222224' : '#F3F4F6' }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#222' : '#F3F4F6' }]}>
                      <HelpCircle size={18} color={isDark ? '#AAA' : '#666'} />
                    </View>
                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#111' }]}>
                      Help & Editorial Standards
                    </Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#555' : '#CCC'} />
                </TouchableOpacity>

                {/* Sign Out */}
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                  onPress={handleSignOut}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                      <LogOut size={18} color="#DC2626" />
                    </View>
                    <Text style={[styles.menuTitle, { color: '#DC2626' }]}>Sign Out</Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#555' : '#CCC'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* ── GUEST USER VIEW ── */
          <View>
            {/* Guest Info Section */}
            <View style={styles.guestSection}>
              <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#1C1C1E' : '#EAEAEA' }]}>
                <User size={42} color={isDark ? '#666' : '#999'} />
              </View>
              <Text style={[styles.guestName, { color: isDark ? '#FFF' : '#111' }]}>
                Welcome to Inked
              </Text>
              <Text style={[styles.guestSubtitle, { color: isDark ? '#8E8E93' : '#6E6E73' }]}>
                Sign in or create an account to sync your saved bookmarks, customize your news categories, and unlock creator features.
              </Text>
            </View>

            {/* Auth Action Buttons */}
            <View style={styles.authContainer}>
              <TouchableOpacity
                style={[styles.googleButton, { backgroundColor: isDark ? '#FFFFFF' : '#111113' }]}
                activeOpacity={0.85}
                onPress={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (e) {
                    Alert.alert('Google Sign-In', 'Could not complete sign-in. Please try again.');
                  }
                }}
              >
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                  style={styles.googleLogoImage}
                />
                <Text style={[styles.googleBtnText, { color: isDark ? '#111113' : '#FFFFFF' }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Guest Saved Stories (if any) */}
            {savedArticles.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Bookmark size={16} color="#DC2626" />
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111' }]}>
                      Locally Saved Stories ({savedArticles.length})
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 10, marginTop: 10 }}>
                  {savedArticles.slice(0, 3).map((item, idx) => (
                    <TouchableOpacity
                      key={item._id || item.link || idx}
                      style={[
                        styles.savedCard,
                        {
                          backgroundColor: isDark ? '#161618' : '#FFFFFF',
                          borderColor: isDark ? '#262628' : '#F0F0F0',
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.savedSource}>{item.source || 'Inked News'}</Text>
                        <Text
                          style={[
                            styles.savedHeadline,
                            { color: isDark ? '#FFFFFF' : '#111113' },
                          ]}
                          numberOfLines={2}
                        >
                          {item.headline}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Menu Items */}
            <View style={styles.section}>
              <View style={[styles.menuContainer, { backgroundColor: isDark ? '#161618' : '#FFFFFF', borderColor: isDark ? '#262628' : '#EAEAEA' }]}>
                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomColor: isDark ? '#222224' : '#F3F4F6' }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#222' : '#F3F4F6' }]}>
                      <HelpCircle size={18} color={isDark ? '#AAA' : '#666'} />
                    </View>
                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#111' }]}>
                      Help & Support
                    </Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#555' : '#CCC'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { borderBottomWidth: 0 }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#222' : '#F3F4F6' }]}>
                      <Info size={18} color={isDark ? '#AAA' : '#666'} />
                    </View>
                    <Text style={[styles.menuTitle, { color: isDark ? '#FFF' : '#111' }]}>
                      About Inked News
                    </Text>
                  </View>
                  <ChevronRight size={18} color={isDark ? '#555' : '#CCC'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginTop: 4,
  },
  memberBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  editTopicsLink: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  topicPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  topicPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  savedSource: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  savedHeadline: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  savedImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  noSavedBox: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  noSavedText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  guestSection: {
    alignItems: 'center',
    paddingHorizontal: 28,
    marginTop: 10,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  guestName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  authContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  googleLogoImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
});
