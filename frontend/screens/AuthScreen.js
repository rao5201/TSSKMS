import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export default function AuthScreen({ navigation, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请填写用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const url = isLogin ? `${API_BASE}/api/user/login` : `${API_BASE}/api/user/register`;
      const body = isLogin ? { username, password } : { username, password, nickname };
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || '操作失败');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userId', String(data.userId));
      await AsyncStorage.setItem('username', data.username);
      onLogin && onLogin();
    } catch (e) {
      Alert.alert('错误', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#0F0F1A', '#1E2D0F']} style={styles.gradient} />
      <View style={styles.content}>
        <Text style={styles.logo}>🦐🍵🪞</Text>
        <Text style={styles.title}>茶海虾王·镜心</Text>
        <Text style={styles.sub}>以茶为镜，照见本心</Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>登录</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>注册</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="用户名" placeholderTextColor="#666"
          value={username} onChangeText={setUsername} autoCapitalize="none" />
        {!isLogin && (
          <TextInput style={styles.input} placeholder="昵称（可选）" placeholderTextColor="#666"
            value={nickname} onChangeText={setNickname} />
        )}
        <TextInput style={styles.input} placeholder="密码" placeholderTextColor="#666"
          value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.btnText}>{isLogin ? '🍵 进入镜心' : '✨ 加入镜心'}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { flex: 1, justifyContent: 'center', padding: 32 },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4, marginBottom: 40 },
  tabs: { flexDirection: 'row', marginBottom: 24, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)', padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 28, alignItems: 'center' },
  tabActive: { backgroundColor: '#6B8E23' },
  tabText: { color: '#888', fontSize: 15 },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, color: '#fff', marginBottom: 16, fontSize: 15 },
  btn: { backgroundColor: '#6B8E23', borderRadius: 32, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
