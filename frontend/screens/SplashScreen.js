import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');
export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const mirrorAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(mirrorAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(mirrorAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(async () => {
      const token = await AsyncStorage.getItem('token');
      navigation.replace(token ? 'Main' : 'Auth');
    }, 2500);
  }, []);
  const mirrorRotate = mirrorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });
  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.8],
  });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#6B8E23', '#1E88E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      <Animated.View style={[styles.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
      <Animated.View style={[styles.mirrorRing, { transform: [{ rotate: mirrorRotate }] }]}>
        <View style={styles.mirrorInner} />
      </Animated.View>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🦐🍵🪞</Text>
          <Text style={styles.logoMain}>茶海虾王·镜心</Text>
          <View style={styles.mirrorBadge}><Text style={styles.mirrorBadgeText}>Mirror Soul</Text></View>
        </View>
        <Text style={styles.slogan}>以茶为镜，照见本心</Text>
        <Text style={styles.subSlogan}>在情绪的镜面里，遇见真实的自己</Text>
        <View style={styles.footer}>
          <Text style={styles.company}>海南茶海虾王管理有限责任公司</Text>
          <Text style={styles.copyright}>出品</Text>
        </View>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  ripple: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'center', top: height / 2 - 100 },
  mirrorRing: { position: 'absolute', width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignSelf: 'center', top: height / 2 - 90, justifyContent: 'center', alignItems: 'center' },
  mirrorInner: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 80, marginBottom: 20 },
  logoMain: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  mirrorBadge: { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  mirrorBadgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  slogan: { fontSize: 18, color: 'rgba(255,255,255,0.95)', marginTop: 20 },
  subSlogan: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  company: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  copyright: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
});
