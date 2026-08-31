import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { MAIN_BACKEND_URL } from '../config/api';
import { getFCMToken, setupFCMListeners } from '../services/fcmService';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import io from 'socket.io-client';

const AuthContext = createContext();

const STORAGE_KEY = '@inked_user_session';
const SAVED_LOCAL_KEY = '@inked_guest_saved_articles';

// Configure Google Sign-In with Web Client ID from Firebase
GoogleSignin.configure({
  webClientId: '863696557178-49b2c1o8nf79oo2b0r7uqb9319l0sves.apps.googleusercontent.com',
  offlineAccess: true,
});

/**
 * Display a local notification (works even when app is open)
 */
async function showLocalNotification(title, body) {
  try {
    await notifee.requestPermission(); // Ensure we have permission

    const channelId = await notifee.createChannel({
      id: 'newsontip_default',
      name: 'NewsOnTip Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        color: '#D32F2F',
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
        style: { type: AndroidStyle.BIGTEXT, text: body },
      },
    });
  } catch (e) {
    console.log('Notification error:', e);
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const fcmInitialized = useRef(false); // Guard: only set up FCM once per session
  const socketRef = useRef(null); // Socket reference

  // Initialize Socket.io connection
  useEffect(() => {
    socketRef.current = io(MAIN_BACKEND_URL);

    socketRef.current.on('connect', () => {
      console.log('⚡ Socket connected:', socketRef.current.id);
    });

    // Bridge socket events to DeviceEventEmitter
    socketRef.current.on('article_updated', async (data) => {
      // Don't process if we caused this event
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === data.senderId || parsed._id === data.senderId) {
          return; // Ignore our own events since we optimistic-update
        }
      }
      DeviceEventEmitter.emit('ArticleUpdated', data);
    });

    // Listen for in-app notifications
    socketRef.current.on('in_app_notification', (data) => {
      showLocalNotification(data.title || "Notification", data.body || "");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Robustly extract user info and sync with backend MongoDB
  const syncWithBackend = async (googleUser) => {
    if (!googleUser) return null;

    try {
      const email = (
        googleUser.email ||
        googleUser.user?.email ||
        googleUser.data?.user?.email ||
        googleUser.providerData?.[0]?.email ||
        auth.currentUser?.email ||
        ''
      )
        .toLowerCase()
        .trim();

      if (!email) {
        console.warn('syncWithBackend: Skipping sync because no valid email was found.');
        return null;
      }

      const name =
        googleUser.name ||
        googleUser.displayName ||
        googleUser.user?.name ||
        googleUser.data?.user?.name ||
        googleUser.providerData?.[0]?.displayName ||
        auth.currentUser?.displayName ||
        email.split('@')[0];

      const photo =
        googleUser.photo ||
        googleUser.photoURL ||
        googleUser.user?.photo ||
        googleUser.data?.user?.photo ||
        googleUser.providerData?.[0]?.photoURL ||
        auth.currentUser?.photoURL ||
        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name || email)}`;

      const googleId =
        googleUser.id ||
        googleUser.uid ||
        googleUser.user?.id ||
        googleUser.data?.user?.id ||
        auth.currentUser?.uid ||
        `google_${Date.now()}`;

      const payload = {
        googleId,
        email,
        name,
        avatar: photo,
        preferredTopics: googleUser.preferredTopics || ['Technology', 'Space & Science', 'Business & Markets'],
      };

      const res = await fetch(`${MAIN_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        setSavedArticles(data.data.savedArticles || []);
        setLikedArticles(data.data.likedArticles || []);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.log('Backend sync error:', e.message);
    }

    // Fallback local user state
    const fallbackEmail =
      googleUser.email ||
      googleUser.user?.email ||
      googleUser.data?.user?.email ||
      auth.currentUser?.email ||
      'reader@inkednews.com';

    const localUser = {
      id: googleUser.id || googleUser.uid || `google_${Date.now()}`,
      email: fallbackEmail,
      name: googleUser.name || googleUser.displayName || fallbackEmail.split('@')[0],
      avatar:
        googleUser.photo ||
        googleUser.photoURL ||
        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(fallbackEmail)}`,
      savedArticles: savedArticles || [],
      likedArticles: likedArticles || [],
      preferredTopics: ['Technology', 'Space & Science', 'Business & Markets'],
      createdAt: new Date().toISOString(),
    };
    setUser(localUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
    return localUser;
  };

  // Load cached session & subscribe to auth state
  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && isMounted) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setSavedArticles(parsed.savedArticles || []);
        setLikedArticles(parsed.likedArticles || []);
        
        // Setup FCM for the cached user (only once)
        if (parsed?.id && !fcmInitialized.current) {
          fcmInitialized.current = true;
          getFCMToken(parsed.id);
          setupFCMListeners(parsed.id);
        }
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      if (firebaseUser && firebaseUser.email) {
        const syncedUser = await syncWithBackend(firebaseUser);
        if (syncedUser?.id && !fcmInitialized.current) {
          fcmInitialized.current = true;
          getFCMToken(syncedUser.id);
          setupFCMListeners(syncedUser.id);
        }
      } else if (!user) {
        const guestSaved = await AsyncStorage.getItem(SAVED_LOCAL_KEY);
        if (guestSaved && isMounted) {
          setSavedArticles(JSON.parse(guestSaved));
        }
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // One-Tap Native Google / Gmail Sign-In
  const loginWithGoogle = async (manualUser = null) => {
    if (manualUser && manualUser.email) {
      return await syncWithBackend(manualUser);
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      console.log('GoogleSignin result received:', JSON.stringify(signInResult));

      // Handle both v12 and v13+ data response structures
      const gUser =
        signInResult.data?.user ||
        signInResult.user ||
        signInResult;

      const idToken =
        signInResult.data?.idToken ||
        signInResult.idToken;

      if (idToken) {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        } catch (firebaseErr) {
          console.log('Firebase credential sign-in note:', firebaseErr.message);
        }
      }

      const email =
        gUser?.email ||
        signInResult.data?.user?.email ||
        auth.currentUser?.email;

      if (email) {
        const synced = await syncWithBackend({
          id: gUser?.id || auth.currentUser?.uid,
          email: email,
          name: gUser?.name || auth.currentUser?.displayName || email.split('@')[0],
          photo: gUser?.photo || auth.currentUser?.photoURL,
        });
        // Show welcome notification on successful login
        const firstName = (synced?.name || email.split('@')[0]).split(' ')[0];
        showLocalNotification(
          `Welcome back, ${firstName}! 👋`,
          "You're signed in to NewsOnTip. Stay ahead with today's top stories."
        );
        return { success: true, user: synced };
      }

      throw new Error('No email found in Google account response');
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
        return { cancelled: true };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services not available');
      }
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  // Sign out from both Firebase and Google Play Services
  const logout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      console.log('Google SignOut error:', e);
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.log('Firebase SignOut error:', e);
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setLikedArticles([]);
    const guestSaved = await AsyncStorage.getItem(SAVED_LOCAL_KEY);
    setSavedArticles(guestSaved ? JSON.parse(guestSaved) : []);
  };

  // Toggle Bookmark for an article
  const toggleBookmark = async (article) => {
    if (!article) return false;

    const existsIndex = savedArticles.findIndex(
      (a) =>
        (a.link && a.link === article.link) ||
        (a.headline && a.headline === article.headline)
    );

    let updated = [];
    let isBookmarkedNow = false;

    if (existsIndex > -1) {
      updated = savedArticles.filter((_, idx) => idx !== existsIndex);
      isBookmarkedNow = false;
    } else {
      updated = [article, ...savedArticles];
      isBookmarkedNow = true;
    }

    setSavedArticles(updated);
    const userId = user?.id || user?._id;
    DeviceEventEmitter.emit('ArticleUpdated', { articleId: article._id, type: 'save', delta: isBookmarkedNow ? 1 : -1 });

    if (user && userId) {
      try {
        await fetch(`${MAIN_BACKEND_URL}/api/user/bookmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, article }),
        });
        const updatedUser = { ...user, savedArticles: updated };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {
        console.log('Error syncing bookmark with server:', e);
      }
    } else {
      await AsyncStorage.setItem(SAVED_LOCAL_KEY, JSON.stringify(updated));
    }

    return isBookmarkedNow;
  };

  // Toggle Like for an article
  const toggleLike = async (article) => {
    if (!article) return false;

    const exists = likedArticles.includes(article.headline);
    const updated = exists
      ? likedArticles.filter((headline) => headline !== article.headline)
      : [...likedArticles, article.headline];

    setLikedArticles(updated);
    const userId = user?.id || user?._id;
    DeviceEventEmitter.emit('ArticleUpdated', { articleId: article._id, type: 'like', delta: exists ? -1 : 1 });

    if (user && userId) {
      try {
        await safeFetch(`/api/interactions/like/${article._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        });
        const updatedUser = { ...user, likedArticles: updated };
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (e) {
        console.log('Error syncing like with server:', e);
      }
    }

    return !exists;
  };

  // Update preferred categories
  const updateTopics = async (topics) => {
    if (!topics) return;
    if (user) {
      const updatedUser = { ...user, preferredTopics: topics };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      if (user.id) {
        fetch(`${MAIN_BACKEND_URL}/api/user/topics`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, topics }),
        }).catch((e) => console.log('Error updating topics on server:', e));
      }
    }
  };

  const isBookmarked = useCallback(
    (article) => {
      if (!article) return false;
      return savedArticles.some(
        (a) =>
          (a.link && a.link === article.link) ||
          (a.headline && a.headline === article.headline)
      );
    },
    [savedArticles]
  );

  const isLiked = useCallback(
    (articleId) => {
      if (!articleId) return false;
      return likedArticles.includes(articleId);
    },
    [likedArticles]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        savedArticles,
        likedArticles,
        loginWithGoogle,
        logout,
        toggleBookmark,
        toggleLike,
        updateTopics,
        isBookmarked,
        isLiked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
