import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function ChatDetailScreen({ route, navigation }) {
  const { otherId, otherName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const flatRef = useRef();

  useEffect(() => {
    navigation.setOptions({ title: otherName });
    AsyncStorage.getItem('userId').then(id => {
      setUserId(id);
      if (id) fetchHistory(id);
    });
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const resp = await fetch(`${API_BASE}/api/chat/history/${uid}/${otherId}`);
      const data = await resp.json();
      setMessages(data.list || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!text.trim() || !userId) return;
    const msg = { id: Date.now(), from_user_id: parseInt(userId), message: text, created_at: new Date().toISOString() };
    setMessages(ms => [...ms, msg]);
    const t = text; setText('');
    try {
      await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: userId, toUserId: otherId, message: t }),
      });
    } catch (e) {}
    setTimeout(() => flatRef.current?.scrollToEnd(), 100);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMine = String(item.from_user_id) === String(userId);
          return (
            <View style={[styles.msgRow, isMine && styles.msgRowRight]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.message}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>发送第一条消息吧 🍵</Text>}
        onContentSizeChange={() => flatRef.current?.scrollToEnd()}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={text} onChangeText={setText}
          placeholder="说点什么..." placeholderTextColor="#666" />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  list: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 10 },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 18 },
  bubbleOther: { backgroundColor: 'rgba(30,30,47,0.9)', borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: '#6B8E23', borderTopRightRadius: 4 },
  bubbleText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 40 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 15 },
  sendBtn: { backgroundColor: '#6B8E23', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 },
  sendText: { color: '#fff', fontWeight: '600' },
});
