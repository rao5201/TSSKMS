import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';

const EMOTION_MAP = {
  happy: { label: '开心', emoji: '😊', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  sad: { label: '悲伤', emoji: '😢', color: '#6B8EC8', bg: 'rgba(107,142,200,0.12)' },
  angry: { label: '愤怒', emoji: '😠', color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  calm: { label: '平静', emoji: '😌', color: '#6B8E23', bg: 'rgba(107,142,35,0.12)' },
  anxious: { label: '焦虑', emoji: '😰', color: '#FFA07A', bg: 'rgba(255,160,122,0.12)' },
};

export default function ResultScreen({ route, navigation }) {
  const { result, text } = route.params || {};
  const emotion = EMOTION_MAP[result?.emotion] || EMOTION_MAP.calm;
  const confidence = Math.round((result?.confidence || 0.8) * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${emotion.emoji} 我的镜心情绪：${emotion.label}\n\n"${result?.poem}"\n\n—— 茶海虾王·镜心`,
      });
    } catch (e) {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.emotionCard, { backgroundColor: emotion.bg, borderColor: emotion.color }]}>
        <Text style={styles.emoji}>{emotion.emoji}</Text>
        <Text style={[styles.emotionLabel, { color: emotion.color }]}>{emotion.label}</Text>
        <Text style={styles.confidence}>置信度 {confidence}%</Text>
        <View style={[styles.bar, { backgroundColor: emotion.color + '33' }]}>
          <View style={[styles.barFill, { width: `${confidence}%`, backgroundColor: emotion.color }]} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍵 你说的话</Text>
        <Text style={styles.originalText}>"{text}"</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪞 镜心诗句</Text>
        <Text style={[styles.poem, { color: emotion.color }]}>{result?.poem}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { borderColor: emotion.color }]} onPress={handleShare}>
          <Text style={[styles.btnText, { color: emotion.color }]}>📤 分享镜心</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { borderColor: '#6B8E23', backgroundColor: '#6B8E23' }]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.btnText, { color: '#fff' }]}>🪞 再次照见</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { padding: 24 },
  emotionCard: { borderRadius: 28, padding: 32, alignItems: 'center', borderWidth: 1, marginBottom: 24 },
  emoji: { fontSize: 72, marginBottom: 12 },
  emotionLabel: { fontSize: 28, fontWeight: 'bold' },
  confidence: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, marginBottom: 12 },
  bar: { width: '100%', height: 6, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  section: { backgroundColor: 'rgba(30,30,47,0.7)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(107,142,35,0.2)' },
  sectionTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 10, fontWeight: '600' },
  originalText: { color: '#fff', fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  poem: { fontSize: 16, lineHeight: 26, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, borderWidth: 1, borderRadius: 28, padding: 14, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '600' },
});
