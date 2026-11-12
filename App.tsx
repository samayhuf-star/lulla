import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo, ActivityIndicator, Alert, FlatList, Linking, Modal, Platform, Pressable, SafeAreaView,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { CATEGORIES, SOUNDS, SOUND_BY_ID, TIMER_OPTIONS, Category } from './src/catalog';
import { FREE_SECONDS, PRIVACY_URL, QA_MODE, SUPPORT_URL, TERMS_URL } from './src/config';
import { parseQaUrl } from './src/qa';
import { mixer } from './src/mixer';
import { addUsed, loadUsed, persistUsed, remainingSeconds } from './src/trial';
import { buy, initIAP, loadPlans, onEntitlementChange, refreshEntitlements, restore, type Plan } from './src/purchases';

SplashScreen.preventAutoHideAsync().catch(() => {});

const C = {
  bg1: '#150a2e', bg2: '#2a1050', bg3: '#0b2a4a',
  card: 'rgba(255,255,255,0.08)', cardOn: 'rgba(167,139,250,0.35)',
  text: '#f5f3ff', sub: '#c4b5fd', accent: '#a78bfa', accent2: '#7c3aed',
};

const fmt = (s: number) => {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const nowMs = (): number => Date.now();

export default function App() {
  const [premium, setPremium] = useState(false);
  const [remaining, setRemaining] = useState(FREE_SECONDS);
  const [, force] = useState(0);
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showMix, setShowMix] = useState(false);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [timerLeft, setTimerLeft] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [qaLine, setQaLine] = useState('');

  const premiumRef = useRef(false);
  const lastTick = useRef(0);
  const sinceSave = useRef(0);

  useEffect(() => {
    premiumRef.current = premium;
  }, [premium]);

  // boot — hide the splash as soon as the UI is mounted. Never wait on StoreKit.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    if (!lastTick.current) lastTick.current = nowMs();
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    (async () => {
      await mixer.init();
      await loadUsed();
      setRemaining(remainingSeconds());
    })();

    (async () => {
      await initIAP();
      setPremium(await refreshEntitlements());
    })();

    // Lock screen / Control Center play goes through the same trial gate as the play button.
    mixer.setRemotePlayGuard(() => {
      if (premiumRef.current || QA_MODE) return true;
      if (remainingSeconds() <= 0) { setShowPaywall(true); return false; }
      lastTick.current = nowMs();
      return true;
    });

    const un1 = mixer.subscribe(() => force((n) => n + 1));
    const un2 = onEntitlementChange(setPremium);
    return () => {
      un1();
      un2();
      motion.remove();
    };
  }, []);

  useEffect(() => {
    if (mixer.playing) activateKeepAwakeAsync('lulla'); else deactivateKeepAwake('lulla');
  });

  // 1s heartbeat: trial accounting (timestamp-based, robust to JS throttling) + sleep timer
  useEffect(() => {
    const id = setInterval(() => {
      const now = nowMs();
      const delta = Math.min(5, Math.max(0, (now - lastTick.current) / 1000));
      lastTick.current = now;

      if (mixer.playing && !premiumRef.current && !QA_MODE) {
        const left = addUsed(delta);
        sinceSave.current += delta;
        setRemaining(left);
        if (sinceSave.current >= 5 || left <= 0) { sinceSave.current = 0; persistUsed(); }
        if (left <= 0) {
          mixer.pause();
          setShowPaywall(true);
        }
      }

      if (timerEnd) {
        const tl = (timerEnd - now) / 1000;
        setTimerLeft(Math.max(0, tl));
        mixer.setTimerLeft(tl > 0 ? tl : null);
        if (tl <= 10 && tl > 0) mixer.setMaster(tl / 10); // gentle fade-out
        if (tl <= 0) {
          mixer.pause();
          mixer.setMaster(1);
          setTimerEnd(null);
        }
      } else {
        mixer.setTimerLeft(null);
      }
      if (QA_MODE) setQaLine(Object.entries(mixer.positions()).map(([k, v]) => `${k} ${v.toFixed(1)}s`).join('  '));
    }, 1000);
    return () => clearInterval(id);
  }, [timerEnd]);

  // QA builds only (EXPO_PUBLIC_LULLA_QA=1, never set for store builds): lulla://qa/play/<id>
  useEffect(() => {
    if (!QA_MODE) return;
    const handle = (url: string | null | undefined) => {
      const cmd = parseQaUrl(url);
      if (!cmd) return;
      mixer.clear();
      if (cmd.kind === 'play') {
        setTimeout(() => {
          cmd.ids.forEach((id) => { if (SOUND_BY_ID[id]) mixer.toggle(id); });
          lastTick.current = nowMs();
          mixer.play();
        }, 1000);
      }
    };
    Linking.getInitialURL().then(handle).catch(() => {});
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, []);

  const gate = useCallback((): boolean => {
    if (premiumRef.current || QA_MODE) return true;
    if (remainingSeconds() <= 0) { setShowPaywall(true); return false; }
    return true;
  }, []);

  const tap = () => {
    if (!reduceMotion) Haptics.selectionAsync().catch(() => {});
  };

  const onTile = (id: string) => {
    tap();
    if (!gate()) return;
    const wasEmpty = mixer.active().length === 0;
    mixer.toggle(id);
    if (wasEmpty && mixer.active().length > 0) { lastTick.current = nowMs(); mixer.play(); }
  };

  const onPlayPause = () => {
    if (mixer.active().length === 0) return;
    if (mixer.playing) mixer.pause();
    else if (gate()) { lastTick.current = nowMs(); mixer.play(); }
  };

  const list = useMemo(() => (cat === 'All' ? SOUNDS : SOUNDS.filter((s) => s.category === cat)), [cat]);
  const active = mixer.active();
  const sheetAnim = reduceMotion ? 'none' : 'slide';

  return (
    <LinearGradient colors={[C.bg1, C.bg2, C.bg3]} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Lulla</Text>
            <Text style={styles.subtitle}>Sleep sounds, softly.</Text>
          </View>
          {premium ? (
            <View style={[styles.pill, { backgroundColor: 'rgba(52,211,153,0.2)' }]}>
              <Text style={[styles.pillText, { color: '#6ee7b7' }]}>Premium</Text>
            </View>
          ) : (
            <Pressable style={styles.pill} onPress={() => setShowPaywall(true)}>
              <Text style={styles.pillText}>
                {remaining > 0 ? `Free: ${fmt(remaining)} left` : 'Unlock'}
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {(['All', ...CATEGORIES] as const).map((c) => (
            <Pressable key={c} onPress={() => setCat(c)} style={[styles.chip, cat === c && styles.chipOn]}>
              <Text style={[styles.chipText, cat === c && { color: '#fff' }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <FlatList
          data={list}
          keyExtractor={(s) => s.id}
          numColumns={3}
          contentContainerStyle={{ padding: 12, paddingBottom: 160 }}
          columnWrapperStyle={{ gap: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const on = mixer.has(item.id);
            return (
              <Pressable onPress={() => onTile(item.id)} style={[styles.tile, on && styles.tileOn]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.tileName} numberOfLines={2}>{item.name}</Text>
              </Pressable>
            );
          }}
        />

        {QA_MODE && qaLine ? <Text style={styles.qa} testID="qa-positions">{qaLine}</Text> : null}

        {/* Bottom player */}
        <View style={styles.player}>
          <Pressable style={styles.sideBtn} onPress={() => setShowMix(true)}>
            <Text style={styles.sideIcon}>🎚️</Text>
            <Text style={styles.sideLabel}>Mix{active.length ? ` · ${active.length}` : ''}</Text>
          </Pressable>
          <Pressable style={[styles.playBtn, active.length === 0 && { opacity: 0.4 }]} onPress={onPlayPause}>
            <Text style={styles.playIcon}>{mixer.playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable style={styles.sideBtn} onPress={() => setShowTimer(true)}>
            <Text style={styles.sideIcon}>⏱️</Text>
            <Text style={styles.sideLabel}>{timerEnd ? fmt(timerLeft) : 'Timer'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Mix sheet */}
      <Modal visible={showMix} transparent animationType={sheetAnim} onRequestClose={() => setShowMix(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowMix(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Your mix</Text>
          {active.length === 0 ? (
            <Text style={styles.sub}>Tap sounds to layer them together.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 360 }}>
              {active.map((id) => (
                <View key={id} style={styles.mixRow}>
                  <Text style={styles.mixName}>{SOUND_BY_ID[id].emoji} {SOUND_BY_ID[id].name}</Text>
                  <VolumeBar value={mixer.volume(id)} onChange={(v) => mixer.setVolume(id, v)} />
                  <Pressable onPress={() => mixer.toggle(id)}><Text style={styles.remove}>✕</Text></Pressable>
                </View>
              ))}
            </ScrollView>
          )}
          {active.length > 0 && (
            <Pressable onPress={() => mixer.clear()} style={styles.clear}><Text style={styles.clearText}>Clear all</Text></Pressable>
          )}
        </View>
      </Modal>

      {/* Timer sheet */}
      <Modal visible={showTimer} transparent animationType={sheetAnim} onRequestClose={() => setShowTimer(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowTimer(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Sleep timer</Text>
          {TIMER_OPTIONS.map((o) => (
            <Pressable
              key={o.label}
              style={styles.timerRow}
              onPress={() => {
                mixer.setMaster(1);
                setTimerEnd(o.minutes ? nowMs() + o.minutes * 60000 : null);
                setTimerLeft(o.minutes * 60);
                setShowTimer(false);
              }}
            >
              <Text style={styles.timerText}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Paywall */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => { setPremium(true); setShowPaywall(false); }}
        expired={remaining <= 0}
        reduceMotion={reduceMotion}
      />
    </LinearGradient>
  );
}

function VolumeBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const steps = 10;
  return (
    <View style={styles.volRow}>
      {Array.from({ length: steps }).map((_, i) => (
        <Pressable key={i} hitSlop={4} onPress={() => onChange((i + 1) / steps)} style={styles.volCell}>
          <View style={[styles.volDot, (i + 1) / steps <= value + 0.001 && styles.volDotOn]} />
        </Pressable>
      ))}
    </View>
  );
}

function Paywall({ visible, onClose, onUnlocked, expired, reduceMotion }: {
  visible: boolean; onClose: () => void; onUnlocked: () => void; expired: boolean; reduceMotion: boolean;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    loadPlans().then((result) => {
      if (cancelled) return;
      setPlans(result.plans);
      setPlansError(result.error);
    });
    return () => { cancelled = true; };
  }, [visible]);

  const onBuy = async (plan: Plan) => {
    setBusy(true);
    try {
      const result = await buy(plan);
      if (result === 'purchased') onUnlocked();
      else if (result === 'pending') Alert.alert('Purchase pending', 'This purchase is waiting for approval.');
      else if (result === 'error') Alert.alert('Purchase failed', 'Please try again.');
    } catch (e: unknown) {
      Alert.alert('Purchase failed', e instanceof Error ? e.message : 'Please try again.');
    } finally { setBusy(false); }
  };

  const doRestore = async () => {
    setBusy(true);
    try {
      if (await restore()) onUnlocked();
      else Alert.alert('Nothing to restore', 'No active subscription was found for this account.');
    } catch (e: unknown) {
      Alert.alert('Restore failed', e instanceof Error ? e.message : 'Please try again.');
    } finally { setBusy(false); }
  };

  const periodLabel = (plan: Plan) => (plan.kind === 'yearly' ? 'year' : 'month');

  return (
    <Modal visible={visible} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose}>
      <LinearGradient colors={[C.bg1, C.bg2, C.bg3]} style={styles.fill}>
        <SafeAreaView style={[styles.fill, { padding: 24 }]}>
          <Pressable onPress={onClose} style={{ alignSelf: 'flex-end' }}><Text style={styles.remove}>✕</Text></Pressable>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 64, textAlign: 'center' }}>🌙</Text>
            <Text style={styles.payTitle}>{expired ? 'Your free 3 minutes are up' : 'Sleep deeper with Lulla'}</Text>
            <Text style={styles.paySub}>Keep the calm going all night.</Text>
            {[`${SOUNDS.length} high-quality sleep sounds`, 'Layer sounds into your own mix', 'Sleep timer with gentle fade-out', 'Plays in the background, screen off'].map((t) => (
              <Text key={t} style={styles.perk}>✓  {t}</Text>
            ))}
          </View>
          {plans.length === 0 ? (
            <View style={[styles.cta, { backgroundColor: 'rgba(124,58,237,0.35)' }]}>
              {busy ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.ctaText}>{plansError ?? 'Prices will appear here when the store is ready.'}</Text>
              )}
            </View>
          ) : plans.map((plan) => (
            <Pressable
              key={plan.id}
              style={[styles.cta, { marginTop: 10 }, busy && { opacity: 0.6 }]}
              disabled={busy}
              onPress={() => onBuy(plan)}
            >
              {busy ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.ctaText}>{plan.label} · {plan.price} / {periodLabel(plan)}</Text>
              )}
            </Pressable>
          ))}
          <Text style={styles.fine}>
            {plans.length
              ? `Subscriptions auto-renew until cancelled. Cancel anytime in your ${Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} subscription settings.`
              : 'Subscription prices come from the App Store or Google Play and will show here once they load.'}
          </Text>
          <View style={styles.links}>
            <Pressable onPress={doRestore}><Text style={styles.link}>Restore purchases</Text></Pressable>
            <Pressable onPress={() => Linking.openURL(TERMS_URL)}><Text style={styles.link}>Terms</Text></Pressable>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}><Text style={styles.link}>Privacy</Text></Pressable>
            <Pressable onPress={() => Linking.openURL(SUPPORT_URL)}><Text style={styles.link}>Support</Text></Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  qa: { position: 'absolute', top: 54, left: 12, right: 12, color: '#fde68a', fontSize: 11, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { color: C.text, fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { color: C.sub, fontSize: 13, marginTop: 2 },
  pill: { backgroundColor: 'rgba(167,139,250,0.25)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  pillText: { color: C.text, fontWeight: '700', fontSize: 13 },
  catRow: { flexGrow: 0, marginVertical: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.card },
  chipOn: { backgroundColor: C.accent2 },
  chipText: { color: C.sub, fontWeight: '600' },
  tile: { flex: 1 / 3, aspectRatio: 1, backgroundColor: C.card, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 8, borderWidth: 1, borderColor: 'transparent' },
  tileOn: { backgroundColor: C.cardOn, borderColor: C.accent },
  emoji: { fontSize: 34, marginBottom: 6 },
  tileName: { color: C.text, fontSize: 12, textAlign: 'center', fontWeight: '600' },
  player: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: 'rgba(20,10,46,0.92)', borderRadius: 28, paddingVertical: 14, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  sideBtn: { alignItems: 'center', minWidth: 64 },
  sideIcon: { fontSize: 22 },
  sideLabel: { color: C.sub, fontSize: 12, marginTop: 2, fontWeight: '600' },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#fff', fontSize: 22, fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#1d0f3d', padding: 20, paddingBottom: 36, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  sheetTitle: { color: C.text, fontSize: 20, fontWeight: '800', marginBottom: 12 },
  sub: { color: C.sub },
  mixRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  mixName: { color: C.text, fontWeight: '600', width: 130 },
  remove: { color: C.sub, fontSize: 20, paddingHorizontal: 8 },
  volRow: { flexDirection: 'row', flex: 1, marginHorizontal: 6 },
  volCell: { flex: 1, height: 28, alignItems: 'center', justifyContent: 'center' },
  volDot: { width: '70%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  volDotOn: { backgroundColor: C.accent },
  clear: { alignSelf: 'center', marginTop: 12, padding: 8 },
  clearText: { color: '#fda4af', fontWeight: '700' },
  timerRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.15)' },
  timerText: { color: C.text, fontSize: 16, textAlign: 'center', fontWeight: '600' },
  payTitle: { color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  paySub: { color: C.sub, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  perk: { color: C.text, fontSize: 16, marginVertical: 6, paddingHorizontal: 24 },
  cta: { backgroundColor: C.accent2, paddingVertical: 18, borderRadius: 999, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', paddingHorizontal: 12 },
  fine: { color: C.sub, fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 14, flexWrap: 'wrap' },
  link: { color: C.sub, fontSize: 12, textDecorationLine: 'underline' },
});
