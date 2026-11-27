// First-launch onboarding: 10 short screens, then the paywall (which the listener can close).
// Shown once; the choice is stored locally. QA builds skip it so the sim harness lands on Home.
import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { setPushConsent } from './push';

export const ONBOARDING_SCREENS = 10;
const DONE_KEY = 'lulla.onboarding.done.v1';

export async function onboardingDone(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(DONE_KEY)) === '1'; } catch { return true; }
}

type Step =
  | { kind: 'info'; emoji: string; title: string; body: string }
  | { kind: 'choice'; emoji: string; title: string; body: string; options: string[] }
  | { kind: 'reminders' };

const STEPS: Step[] = [
  { kind: 'info', emoji: '🌙', title: 'Welcome to Lulla', body: 'Calm sounds to help you fall asleep, stay asleep and wake up rested.' },
  { kind: 'choice', emoji: '😴', title: 'What keeps you up?', body: 'Pick the one that fits best.', options: ['A busy mind', 'Noise around me', 'Light sleep', 'Getting a baby to sleep'] },
  { kind: 'choice', emoji: '🕙', title: 'When do you usually go to bed?', body: 'Lulla works best with a steady routine.', options: ['Before 10 pm', '10 pm to midnight', 'After midnight', 'It changes'] },
  { kind: 'info', emoji: '🌧️', title: 'Nature, noise and lullabies', body: 'Rain, ocean, forest, fan, white and brown noise, soft lullabies and more.' },
  { kind: 'info', emoji: '🎚️', title: 'Make your own mix', body: 'Layer several sounds and set each volume. Rain on a tent with a distant fan? Done.' },
  { kind: 'info', emoji: '🧠', title: 'Binaural tones', body: 'Gentle 432 Hz and delta tones for deep, slow-wave sleep. Best with headphones.' },
  { kind: 'info', emoji: '⏲️', title: 'Sleep timer with a soft fade', body: 'Pick 10 minutes to all night. Sounds fade out slowly so nothing jolts you awake.' },
  { kind: 'info', emoji: '🔒', title: 'Plays from the lock screen', body: 'Keeps playing in the background and with the screen off. Control it from the lock screen.' },
  { kind: 'reminders' },
  { kind: 'info', emoji: '✨', title: 'Free sounds are yours', body: 'Seven sounds are free forever. Premium unlocks every sound, lullaby and tone.' },
];

const C = { bg1: '#150a2e', bg2: '#2a1050', bg3: '#0b2a4a', text: '#f5f3ff', sub: '#c4b5fd', accent2: '#7c3aed', card: 'rgba(255,255,255,0.08)', cardOn: 'rgba(167,139,250,0.35)' };

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const finish = async () => {
    try { await AsyncStorage.setItem(DONE_KEY, '1'); } catch { /* ignore */ }
    onDone();
  };
  const next = () => (last ? finish() : setI(i + 1));
  const reminders = async (on: boolean) => {
    if (on) await setPushConsent(true);
    next();
  };

  return (
    <LinearGradient colors={[C.bg1, C.bg2, C.bg3]} style={s.fill}>
      <SafeAreaView style={s.fill}>
        <View style={s.dots} accessibilityLabel={`Step ${i + 1} of ${STEPS.length}`}>
          {STEPS.map((_, n) => <View key={n} style={[s.dot, n === i && s.dotOn]} />)}
        </View>
        <ScrollView contentContainerStyle={s.body}>
          {step.kind === 'reminders' ? (
            <>
              <Text style={s.emoji}>🔔</Text>
              <Text style={s.title}>Bedtime reminders?</Text>
              <Text style={s.sub}>An optional nudge at wind-down time, plus news when new sounds arrive. Off unless you turn it on; change it anytime in Settings.</Text>
            </>
          ) : (
            <>
              <Text style={s.emoji}>{step.emoji}</Text>
              <Text style={s.title}>{step.title}</Text>
              <Text style={s.sub}>{step.body}</Text>
              {step.kind === 'choice' ? step.options.map((o) => (
                <Pressable key={o} style={[s.opt, picked[i] === o && s.optOn]} onPress={() => setPicked({ ...picked, [i]: o })} accessibilityRole="button" accessibilityState={{ selected: picked[i] === o }}>
                  <Text style={s.optText}>{o}</Text>
                </Pressable>
              )) : null}
            </>
          )}
        </ScrollView>
        <View style={s.footer}>
          {step.kind === 'reminders' ? (
            <>
              <Pressable style={s.cta} onPress={() => reminders(true)} accessibilityRole="button"><Text style={s.ctaText}>Turn on reminders</Text></Pressable>
              <Pressable onPress={() => reminders(false)} accessibilityRole="button"><Text style={s.skip}>Not now</Text></Pressable>
            </>
          ) : (
            <>
              <Pressable style={s.cta} onPress={next} accessibilityRole="button" testID="onboarding-next"><Text style={s.ctaText}>{last ? 'Start listening' : 'Continue'}</Text></Pressable>
              {!last ? <Pressable onPress={finish} accessibilityRole="button"><Text style={s.skip}>Skip</Text></Pressable> : null}
            </>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { width: 18, backgroundColor: C.text },
  body: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: { color: C.text, fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  sub: { color: C.sub, fontSize: 17, lineHeight: 24, textAlign: 'center', marginBottom: 20 },
  opt: { backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 10 },
  optOn: { backgroundColor: C.cardOn },
  optText: { color: C.text, fontSize: 17, textAlign: 'center' },
  footer: { padding: 24, gap: 14 },
  cta: { backgroundColor: C.accent2, borderRadius: 16, padding: 18, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  skip: { color: C.sub, fontSize: 16, textAlign: 'center' },
});
