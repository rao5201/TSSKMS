import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function TopicsScreen({ navigation }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/topics`)
      .then(r => r.json())
      .then(d => setTopics(d.list || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>🏷 热门话题</Text></View>}
        ListEmptyComponent={<Text style={styles.empty}>暂无话题</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.topicName}># {item.name}</Text>
            <Text style={styles.postsCount}>{item.posts_count || 0} 讨论</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  list: { paddingBottom: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  topicName: { color: '#6B8E23', fontSize: 16, fontWeight: '600' },
  postsCount: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 60 },
});
