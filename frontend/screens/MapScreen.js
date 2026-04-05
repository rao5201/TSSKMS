import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function MapScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺 情绪地图</Text>
        <Text style={styles.sub}>发现附近的情绪共鸣</Text>
      </View>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺</Text>
        <Text style={styles.mapText}>地图功能即将上线</Text>
        <Text style={styles.mapSub}>接入腾讯地图后可查看附近用户情绪分布</Text>
      </View>
      <TouchableOpacity style={styles.nearbyBtn} onPress={() => navigation.navigate('Nearby')}>
        <Text style={styles.nearbyText}>🦐 查看附近的人</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapEmoji: { fontSize: 72, marginBottom: 16 },
  mapText: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  mapSub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  nearbyBtn: { margin: 24, backgroundColor: '#6B8E23', borderRadius: 28, padding: 16, alignItems: 'center' },
  nearbyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
