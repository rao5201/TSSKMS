import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { setUserId(id); if (id) fetchChats(id); });
  }, []);

  const fetchChats = async (uid) => {
    try {
      const resp = await fetch(`${API_BASE}/api/chat/list/${uid}`);
      const data = await resp.json();
      setChats(data.list || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => String(item.other_id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatDetail', { otherId: item.other_id, otherName: item.nickname || item.username })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.nickname || item.username || '?')[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.nickname || item.username}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.last_message || '暂无消息'}</Text>
            </View>
            <Text style={styles.time}>{item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : ''}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>暂无聊天，去交个朋友吧 🦐</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#6B8E23', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  name: { color: '#fff', fontWeight: '600', fontSize: 15 },
  lastMsg: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 60, fontSize: 15 },
});
