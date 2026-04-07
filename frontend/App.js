import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import MomentsScreen from './screens/MomentsScreen';
import VideosScreen from './screens/VideosScreen';
import LiveScreen from './screens/LiveScreen';
import TopicsScreen from './screens/TopicsScreen';
import NearbyScreen from './screens/NearbyScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import GiftShopScreen from './screens/GiftShopScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === '镜心') iconName = focused ? 'create' : 'create-outline';
          else if (route.name === '茶海') iconName = focused ? 'albums' : 'albums-outline';
          else if (route.name === '虾王') iconName = focused ? 'videocam' : 'videocam-outline';
          else if (route.name === '直播') iconName = focused ? 'tv' : 'tv-outline';
          else if (route.name === '我的') iconName = focused ? 'person' : 'person-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { 
          backgroundColor: '#1E1E2F', 
          borderTopColor: '#2D2D3A',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6B8E23',
        tabBarInactiveTintColor: '#888',
        headerStyle: { backgroundColor: '#1A1A2E', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="镜心" component={HomeScreen} />
      <Tab.Screen name="茶海" component={MomentsScreen} />
      <Tab.Screen name="虾王" component={VideosScreen} />
      <Tab.Screen name="直播" component={LiveScreen} />
      <Tab.Screen name="我的" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkLoginStatus();
  }, []);
  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false);
  };
  if (loading) {
    return <SplashScreen navigation={{ replace: () => {} }} />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true, title: '镜心' }} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={{ headerShown: true, title: '聊天' }} />
            <Stack.Screen name="GiftShop" component={GiftShopScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
