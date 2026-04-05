import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function GiftShopScreen({ navigation, route }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [userId, setUserId] = useState(null);
  const { toUserId, roomId } = route?.params || {};

  useEffect(() => {
    AsyncStorage.getItem('userId').then(async id => {
      setUserId(id);
      await fetchGifts();
      if (id) fetchCoins(id);
    });
  }, []);

  const fetchGifts = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/gifts`);
      const data = await resp.json();
      setGifts(data.list || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const fetchCoins = async (uid) => {
    try {
      const resp = await fetch(`${API_BASE}/api/user/profile/${uid}`);
      const data = await resp.json();
      setCoins(data.coins || 0);
    } catch (e) {}
  };

  const sendGift = async (gift) => {
    if (!toUserId) { Alert.alert('提示', '请先选择要赠送的用户'); return; }
    if (coins < gift.price) { Alert.alert('金币不足', `需要 ${gift.price} 金币，当前余额 ${coins} 金币`); return; }
    Alert.alert('确认赠送', `赠送 ${gift.icon} ${gift.name} (${gift.price}金币) ?`, [
      { text: '取消' },
      {
        text: '赠送', onPress: async () => {
          try {
            const resp = await fetch(`${API_BASE}/api/gifts/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fromUserId: userId, toUserId, giftId: gift.id, roomId }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error);
            setCoins(c => c - gift.price);
            Alert.alert('赠送成功', `${gift.icon} 已送出！`);
          } catch (e) { Alert.alert('赠送失败', e.message); }
        }
      }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#6B8E23" size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎁 礼物商店</Text>
        <Text style={styles.coins}>🪙 {coins}</Text>
      </View>
      <FlatList
        data={gifts}
        keyExtractor={item => String(item.id)}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.giftCard, item.is_hot && styles.giftHot]} onPress={() => sendGift(item)}>
            <Text style={styles.giftIcon}>{item.icon}</Text>
            <Text style={styles.giftName}>{item.name.replace(/^.+ /, '')}</Text>
            <Text style={styles.giftPrice}>🪙 {item.price}</Text>
            {item.is_hot === 1 && <View style={styles.hotBadge}><Text style={styles.hotText}>热</Text></View>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50 },
  close: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  coins: { color: '#FFD700', fontWeight: '600', fontSize: 16 },
  list: { padding: 12 },
  giftCard: { flex: 1, margin: 6, alignItems: 'center', backgroundColor: 'rgba(30,30,47,0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(107,142,35,0.15)', position: 'relative' },
  giftHot: { borderColor: '#FF6B6B' },
  giftIcon: { fontSize: 36, marginBottom: 6 },
  giftName: { color: '#fff', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  giftPrice: { color: '#FFD700', fontSize: 12, fontWeight: '600' },
  hotBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#FF6B6B', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  hotText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
