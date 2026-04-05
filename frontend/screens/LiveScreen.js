import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

function LiveCard({ item }) {
  const statusColor = item.status === 'live' ? '#FF4D4F' : '#6B8E23';
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.thumb}>
        <Text style={styles.thumbEmoji}>📺</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{item.status === 'live' ? '直播中' : '回放'}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title || '直播间'}</Text>
        <Text style={styles.host}>🦐 {item.nickname || item.username}</Text>
        <Text style={styles.viewers}>👁 {item.viewers_count || 0} 人观看</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function LiveScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/live`);
      const data = await resp.json();
      setRooms(data.list || []);
    } catch (e) {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        renderItem={({ item }) => <LiveCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor="#6B8E23" />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📺 直播广场</Text>
            <Text style={styles.headerSub}>实时互动，遇见有趣的灵魂</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📺</Text>
            <Text style={styles.emptyText}>暂无直播，开启你的第一场！</Text>
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
  header: { padding: 16 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  list: { padding: 8, paddingBottom: 20 },
  card: { flex: 1, margin: 4, backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)' },
  thumb: { height: 120, backgroundColor: 'rgba(107,142,35,0.1)', justifyContent: 'center', alignItems: 'center' },
  thumbEmoji: { fontSize: 40 },
  badge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  info: { padding: 12 },
  title: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  host: { color: '#6B8E23', fontSize: 12, marginBottom: 2 },
  viewers: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
});
