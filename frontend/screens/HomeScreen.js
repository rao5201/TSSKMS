import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const EMOTION_MAP = {
  happy: { label: '开心', emoji: '😊', color: '#FFD700' },
  sad: { label: '悲伤', emoji: '😢', color: '#6B8EC8' },
  angry: { label: '愤怒', emoji: '😠', color: '#FF6B6B' },
  calm: { label: '平静', emoji: '😌', color: '#6B8E23' },
  anxious: { label: '焦虑', emoji: '😰', color: '#FFA07A' },
};

export default function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
  }, []);

  const analyzeEmotion = async () => {
    if (!text.trim()) { Alert.alert('提示', '请先输入你的心情'); return; }
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/generate/emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      navigation.navigate('Result', { result: data, text });
      setText('');
    } catch (e) {
      Alert.alert('分析失败', e.message || '请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🪞</Text>
          <Text style={styles.title}>镜心AI</Text>
          <Text style={styles.sub}>说出你的心情，让AI读懂你</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>此刻，你的心情是？</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            placeholder="今天发生了什么？有什么想说的吗...&#10;以茶为镜，照见本心 🍵"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={text}
            onChangeText={setText}
            maxLength={500}
          />
          <Text style={styles.count}>{text.length}/500</Text>
        </View>
        <View style={styles.emotions}>
          {Object.entries(EMOTION_MAP).map(([key, val]) => (
            <TouchableOpacity key={key} style={[styles.emotionTag, { borderColor: val.color }]}
              onPress={() => setText(t => t + val.label)}>
              <Text>{val.emoji} {val.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={analyzeEmotion} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.btnText}>🪞 照见本心</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  scroll: { padding: 20, paddingTop: 12 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  card: { backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(107,142,35,0.3)' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 12 },
  input: { color: '#fff', fontSize: 15, minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },
  count: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'right', marginTop: 8 },
  emotions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  emotionTag: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  btn: { backgroundColor: '#6B8E23', borderRadius: 32, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
