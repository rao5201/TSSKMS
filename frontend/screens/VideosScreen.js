import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

function VideoCard({ item }) {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoThumb}>
        <Text style={styles.videoEmoji}>🎬</Text>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title || '无题视频'}</Text>
          <Text style={styles.videoMeta}>👁 {item.views_count || 0}  ❤️ {item.likes_count || 0}</Text>
          <Text style={styles.videoUser}>@{item.nickname || item.username}</Text>
        </View>
      </View>
    </View>
  );
}

export default function VideosScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/videos`);
      const data = await resp.json();
      setVideos(data.list || []);
    } catch (e) {
      // 静默失败，显示空状态
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        renderItem={({ item }) => <VideoCard item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVideos(); }} tintColor="#6B8E23" />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎬 虾王视频</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyText}>暂无视频，快来发布第一条吧！</Text>
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
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  list: { padding: 8, paddingBottom: 20 },
  videoCard: { width: (width - 24) / 2, margin: 4, backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)' },
  videoThumb: { height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(107,142,35,0.08)', padding: 12 },
  videoEmoji: { fontSize: 40, marginBottom: 8 },
  videoInfo: { width: '100%' },
  videoTitle: { color: '#fff', fontWeight: '600', fontSize: 13, marginBottom: 4 },
  videoMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 2 },
  videoUser: { color: '#6B8E23', fontSize: 11 },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
});
