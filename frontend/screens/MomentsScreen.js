import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

function MomentItem({ item, onLike }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.nickname || item.username || '?')[0]}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{item.nickname || item.username}</Text>
          <Text style={styles.time}>{new Date(item.created_at).toLocaleString('zh-CN')}</Text>
        </View>
        {item.emotion && <Text style={styles.emotionTag}>{item.emotion}</Text>}
      </View>
      <Text style={styles.content}>{item.content}</Text>
      {item.location && <Text style={styles.location}>📍 {item.location}</Text>}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(item.id)}>
          <Text style={styles.actionText}>❤️ {item.likes_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>💬 {item.comments_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MomentsScreen({ navigation }) {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showPost, setShowPost] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/moments`);
      const data = await resp.json();
      setMoments(data.list || []);
    } catch (e) {
      Alert.alert('加载失败', '请检查网络连接');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await fetch(`${API_BASE}/api/moments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content }),
      });
      setContent('');
      setShowPost(false);
      fetchMoments();
    } catch (e) { Alert.alert('发布失败', e.message); }
    finally { setPosting(false); }
  };

  const handleLike = async (momentId) => {
    if (!userId) return;
    await fetch(`${API_BASE}/api/moments/${momentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setMoments(ms => ms.map(m => m.id === momentId ? { ...m, likes_count: (m.likes_count || 0) + 1 } : m));
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={moments}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <MomentItem item={item} onLike={handleLike} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMoments(); }} tintColor="#6B8E23" />}
        ListEmptyComponent={<Text style={styles.empty}>暂无动态，快来发一条吧 🍵</Text>}
        contentContainerStyle={styles.list}
      />
      {showPost && (
        <View style={styles.postBox}>
          <TextInput style={styles.postInput} multiline placeholder="分享你的心情..." placeholderTextColor="#666"
            value={content} onChangeText={setContent} />
          <View style={styles.postActions}>
            <TouchableOpacity onPress={() => setShowPost(false)}><Text style={styles.cancel}>取消</Text></TouchableOpacity>
            <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={posting}>
              <Text style={styles.postBtnText}>{posting ? '发布中...' : '发布'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setShowPost(v => !v)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  list: { padding: 12, paddingBottom: 80 },
  card: { backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6B8E23', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  meta: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 14 },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  emotionTag: { fontSize: 20 },
  content: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 22, marginBottom: 8 },
  location: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6B8E23', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  postBox: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A2E', padding: 16, borderTopWidth: 1, borderColor: 'rgba(107,142,35,0.3)' },
  postInput: { color: '#fff', minHeight: 80, fontSize: 15, textAlignVertical: 'top' },
  postActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 8 },
  cancel: { color: '#888', fontSize: 15 },
  postBtn: { backgroundColor: '#6B8E23', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  postBtnText: { color: '#fff', fontWeight: '600' },
});
