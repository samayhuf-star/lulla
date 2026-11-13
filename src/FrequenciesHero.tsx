import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { HERO_SUB, HERO_TITLE, heroMotion } from './hero';

/** Full-width featured card for the Frequencies category, with a slow breathing glow. */
export function FrequenciesHero({ selected, reduceMotion, onPress }: {
  selected: boolean; reduceMotion: boolean; onPress: () => void;
}) {
  const m = heroMotion(reduceMotion);
  const glow = useSharedValue(m.rest);

  useEffect(() => {
    if (!m.breathe) {
      cancelAnimation(glow);
      glow.value = m.rest;
      return;
    }
    glow.value = m.min;
    glow.value = withRepeat(withTiming(m.max, { duration: m.periodMs / 2, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(glow);
  }, [m.breathe, m.min, m.max, m.rest, m.periodMs, glow]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${HERO_TITLE}. ${HERO_SUB}`}
      accessibilityState={{ selected }}
      testID="frequencies-hero"
      style={styles.wrap}
    >
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} testID="frequencies-hero-glow" />
      <LinearGradient
        colors={['#7c3aed', '#5b21b6', '#3730a3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, selected && styles.cardOn]}
      >
        <Text style={styles.icon}>🎐</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{HERO_TITLE}</Text>
          <Text style={styles.sub} numberOfLines={2}>{HERO_SUB}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 4, marginBottom: 4 },
  glow: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 26,
    backgroundColor: 'rgba(167,139,250,0.35)',
    shadowColor: '#a78bfa', shadowOpacity: 0.9, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
  },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18, borderWidth: 1, borderColor: 'rgba(196,181,253,0.35)' },
  cardOn: { borderColor: '#f5f3ff', borderWidth: 1.5 },
  icon: { fontSize: 34, marginRight: 14 },
  title: { color: '#f5f3ff', fontSize: 19, fontWeight: '800' },
  sub: { color: '#ddd6fe', fontSize: 12, marginTop: 3, lineHeight: 16 },
  chev: { color: '#f5f3ff', fontSize: 28, fontWeight: '300', marginLeft: 8 },
});
