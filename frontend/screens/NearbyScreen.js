import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function NearbyScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearby();
  }, []);

  const loadNearby = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      // 模拟位置（海南海口）
      const resp = await fetch(`${API_BASE}/api/nearby?lat=20.04&lng=110.35&userId=${userId}&radius=50`);
      const data = await resp.json();
      setUsers(data.list || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🦐 附近的人</Text>
        <Text style={styles.sub}>发现周围志同道合的灵魂</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => navigation.navigate('ChatDetail', { otherId: item.id, otherName: item.nickname || item.username })}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(item.nickname || item.username || '?')[0]}</Text></View>
            <Text style={styles.name} numberOfLines={1}>{item.nickname || item.username}</Text>
            <Text style={styles.dist}>{item.distance ? `${item.distance.toFixed(1)}km` : '附近'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌊</Text>
            <Text style={styles.emptyText}>附近暂无用户</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  header: { padding: 20, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  list: { padding: 8 },
  card: { flex: 1, margin: 6, alignItems: 'center', backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6B8E23', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  name: { color: '#fff', fontSize: 13, fontWeight: '600', maxWidth: 70, textAlign: 'center' },
  dist: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
});
