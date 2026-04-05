import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) { setLoading(false); return; }
    try {
      const resp = await fetch(`${API_BASE}/api/user/profile/${userId}`);
      const data = await resp.json();
      setUser(data);
      setCoins(data.coins || 0);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'userId', 'username']);
          navigation.replace('Auth');
        }
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.nickname || user?.username || '?')[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.nickname || user?.username || '未知用户'}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>
      {/* 金币 */}
      <View style={styles.coinsCard}>
        <Text style={styles.coinsLabel}>🪙 金币余额</Text>
        <Text style={styles.coinsValue}>{coins}</Text>
      </View>
      {/* 菜单 */}
      <View style={styles.menu}>
        {[
          { icon: '🪞', label: '我的情绪记录' },
          { icon: '🍵', label: '我的动态' },
          { icon: '🎬', label: '我的视频' },
          { icon: '👥', label: '好友列表', onPress: () => navigation.navigate('ChatList') },
          { icon: '🎁', label: '礼物商店', onPress: () => navigation.navigate('GiftShop') },
        ].map(item => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
      <Text style={styles.version}>茶海虾王·镜心 v1.0.4</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  header: { alignItems: 'center', padding: 32, paddingBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6B8E23', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  username: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
  bio: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 8, textAlign: 'center' },
  coinsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(107,142,35,0.15)', borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(107,142,35,0.3)' },
  coinsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  coinsValue: { color: '#FFD700', fontSize: 22, fontWeight: 'bold' },
  menu: { marginHorizontal: 20, backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuIcon: { fontSize: 20, width: 32 },
  menuLabel: { flex: 1, color: '#fff', fontSize: 15 },
  menuArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 20 },
  logoutBtn: { margin: 20, marginTop: 24, padding: 14, borderRadius: 28, borderWidth: 1, borderColor: '#FF6B6B', alignItems: 'center' },
  logoutText: { color: '#FF6B6B', fontWeight: '600', fontSize: 15 },
  version: { textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8 },
});
