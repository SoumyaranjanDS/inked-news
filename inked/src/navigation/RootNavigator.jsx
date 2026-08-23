import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators
import MainTabs from './MainTabs';

// Onboarding Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel';

// Core Screens (Not in Tabs)
import ArticleDetailScreen from '../screens/main/ArticleDetailScreen';
import CategoryFeedScreen from '../screens/main/CategoryFeedScreen';

// Creator Screens
import CreatorDashboardScreen from '../screens/creator/CreatorDashboardScreen';
import WriteArticleScreen from '../screens/creator/WriteArticleScreen';
import MyArticlesScreen from '../screens/creator/MyArticlesScreen';
import AnalyticsScreen from '../screens/creator/AnalyticsScreen';
import PayoutScreen from '../screens/creator/PayoutScreen';
import IDVerificationScreen from '../screens/creator/IDVerificationScreen';

// Auth
import AuthBottomSheetModal from '../screens/auth/AuthBottomSheetModal';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Onboarding Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingCarousel" component={OnboardingCarousel} />

      {/* Main App */}
      <Stack.Screen name="Main" component={MainTabs} />
      
      {/* Article Detail */}
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="CategoryFeed" component={CategoryFeedScreen} />

      {/* Creator Flow */}
      <Stack.Screen name="CreatorDashboard" component={CreatorDashboardScreen} />
      <Stack.Screen name="WriteArticle" component={WriteArticleScreen} />
      <Stack.Screen name="MyArticles" component={MyArticlesScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Payout" component={PayoutScreen} />
      <Stack.Screen name="IDVerification" component={IDVerificationScreen} />

      {/* Modals */}
      <Stack.Screen 
        name="AuthModal" 
        component={AuthBottomSheetModal} 
        options={{ presentation: 'transparentModal' }} 
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
