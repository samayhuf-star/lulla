import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { planTimer, timerDone, timerGain, type TimerMinutes, type TimerPlan } from './src/timer';
import { FREE_SECONDS, PRIVACY_URL, QA_MODE, SUPPORT_URL, TERMS_URL } from './src/config';
import { parseQaUrl } from './src/qa';
import { mixer } from './src/mixer';
import { addUsed, loadUsed, persistUsed, remainingSeconds, setUsedForQa } from './src/trial';
import {
  PAYWALL_SUB, PAYWALL_TITLE, blockedInMix, countsTowardPreview, isLocked, onPreviewEnded, tileAction,
} from './src/access';
import { buy, initIAP, loadPlans, onEntitlementChange, refreshEntitlements, restore, type Plan } from './src/purchases';

SplashScreen.preventAutoHideAsync().catch(() => {});

const C = {
  bg1: '#150a2e', bg2: '#2a1050', bg3: '#0b2a4a',
  card: 'rgba(255,255,255,0.08)', cardOn: 'rgba(167,139,250,0.35)',
  text: '#f5f3ff', sub: '#c4b5fd', accent: '#a78bfa', accent2: '#7c3aed',
};

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = Math.floor(s % 60);
  const mm = h ? m.toString().padStart(2, '0') : `${m}`;
  return `${h ? `${h}:` : ''}${mm}:${r.toString().padStart(2, '0')}`;
};

const qaLog = (msg: string) => {
  // QA builds only. console.error reaches the device log in a Release build (os_log).
  if (QA_MODE) console.error(`[QA] ${msg}`);
};

const nowMs = (): number => Date.now();

/**
 * A tap on a sound tile (finger or QA deep link, same path). A sound already in the mix can
 * always be removed. A locked premium sound opens the paywall. Free sounds always play.
 */
function tapTile(id: string, premium: boolean, openPaywall: () => void, onStart: () => void) {
  if (!mixer.has(id) && tileAction(id, { premium, previewLeft: remainingSeconds() }) === 'paywall') {
    openPaywall();
    return;
  }
  const wasEmpty = mixer.active().length === 0;
  mixer.toggle(id);
  if (wasEmpty && mixer.active().length > 0) { onStart(); mixer.play(); }
}

export default function App() {
  const [premium, setPremium] = useState(false);
  const [remaining, setRemaining] = useState(FREE_SECONDS);
  const [, force] = useState(0);
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showMix, setShowMix] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timerPlan, setTimerPlan] = useState<TimerPlan | null>(null);
  const [allNight, setAllNight] = useState(false);
  const [timerLeft, setTimerLeft] = useState(0);
  const [qaTimer, setQaTimer] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [qaLine, setQaLine] = useState('');

  const premiumRef = useRef(false);
  const lastTick = useRef(0);
  const sinceSave = useRef(0);

  useEffect(() => {
    premiumRef.current = premium;
  }, [premium]);

  /** Pick a sleep timer option. All night (null) schedules nothing: the loops play until stopped. */
  const applyTimer = (minutes: TimerMinutes) => {
    mixer.setMaster(1);
    const now = nowMs();
    const plan = planTimer(now, minutes);
    setTimerPlan(plan);
    setAllNight(minutes === null);
    setTimerLeft(plan ? (plan.endMs - now) / 1000 : 0);
    if (QA_MODE) {
      const line = plan
        ? `timer ${minutes} min: start ${new Date(plan.startMs).toISOString()} fade ${new Date(plan.fadeStartMs).toISOString()} end ${new Date(plan.endMs).toISOString()}`
        : `timer ${minutes === null ? 'All night: no stop scheduled' : 'off'}`;
      setQaTimer(line);
      qaLog(line);
    }
  };

  /**
   * Before the mix (re)starts: drop any premium sounds the listener cannot play right now.
   * Returns false (and keeps the mix) only when every sound in it is locked.
   */
  const stripBlocked = (): boolean => {
    const ids = mixer.active();
    if (ids.length === 0) return true;
    const blocked = blockedInMix(ids, { premium: premiumRef.current, previewLeft: remainingSeconds() });
    if (blocked.length === ids.length) return false;
    blocked.forEach((id) => mixer.toggle(id));
    return true;
  };

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

    // Lock screen / Control Center play goes through the same gate as the play button:
    // free sounds always play; premium sounds only with premium or preview time left.
    mixer.setRemotePlayGuard(() => {
      if (!stripBlocked()) { setShowPaywall(true); return false; }
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

      // Only premium sounds use the preview clock. Free sounds never stop for it.
      if (mixer.playing && countsTowardPreview(mixer.active(), premiumRef.current)) {
        const left = addUsed(delta);
        sinceSave.current += delta;
        setRemaining(left);
        if (sinceSave.current >= 5 || left <= 0) { sinceSave.current = 0; persistUsed(); }
        if (left <= 0) {
          const end = onPreviewEnded(mixer.active());
          if (end.pauseAndPaywall) {
            mixer.pause();
            setShowPaywall(true);
          } else {
            end.remove.forEach((id) => mixer.toggle(id));
          }
        }
      }

      if (timerPlan) {
        const tl = (timerPlan.endMs - now) / 1000;
        setTimerLeft(Math.max(0, tl));
        mixer.setTimerLeft(tl > 0 ? tl : null);
        if (now > timerPlan.fadeStartMs) mixer.setMaster(timerGain(now, timerPlan)); // last 60 s fade-out
        if (timerDone(now, timerPlan)) {
          mixer.pause();
          mixer.setMaster(1);
          setTimerPlan(null);
        }
      } else {
        mixer.setTimerLeft(null);
      }
      if (QA_MODE) {
        const line = Object.entries(mixer.positions()).map(([k, v]) => `${k} ${v.toFixed(1)}s`).join('  ');
        setQaLine(line);
        if (line) qaLog(`pos ${new Date(now).toISOString()} ${line}`);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timerPlan]);

  // QA builds only (EXPO_PUBLIC_LULLA_QA=1, never set for store builds): lulla://qa/play/<id>
  useEffect(() => {
    if (!QA_MODE) return;
    const handle = (url: string | null | undefined) => {
      const cmd = parseQaUrl(url);
      if (!cmd) return;
      // These go through the real UI handlers, exactly like a finger tap.
      if (cmd.kind === 'tap') {
        tapTile(cmd.id, premiumRef.current, () => setShowPaywall(true), () => { lastTick.current = nowMs(); });
        return;
      }
      if (cmd.kind === 'close') { setShowPaywall(false); setShowSettings(false); setShowTimer(false); return; }
      if (cmd.kind === 'settings') { setShowPaywall(false); setShowSettings(true); return; }
      if (cmd.kind === 'preview') { setRemaining(setUsedForQa(cmd.state === 'used' ? FREE_SECONDS : 0)); return; }
      if (cmd.kind === 'timer') { setShowTimer(false); applyTimer(cmd.minutes); return; }
      if (cmd.kind === 'timersheet') { setShowPaywall(false); setShowTimer(true); return; }
      if (cmd.kind === 'cat') {
        const c = CATEGORIES.find((x) => x.toLowerCase().split(/[^a-z]/)[0] === cmd.slug);
        setCat(cmd.slug === 'all' || !c ? 'All' : c);
        return;
      }
      if (cmd.kind === 'wrap') {
        mixer.clear();
        setTimeout(() => {
          if (!SOUND_BY_ID[cmd.id]) return;
          mixer.toggle(cmd.id);
          lastTick.current = nowMs();
          mixer.play();
          setTimeout(() => {
            mixer.seekForQa(cmd.id, 4);
            qaLog(`wrap ${cmd.id}: loop length ${mixer.durationForQa(cmd.id).toFixed(3)} s, jumped to 4 s before the loop point`);
          }, 2500);
        }, 1000);
        return;
      }
      mixer.clear();
      if (cmd.kind === 'paywall') { setShowPaywall(true); return; }
      setShowPaywall(false);
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


  const tap = () => {
    if (!reduceMotion) Haptics.selectionAsync().catch(() => {});
  };

  const onTile = (id: string) => {
    tap();
    tapTile(id, premiumRef.current, () => setShowPaywall(true), () => { lastTick.current = nowMs(); });
  };

  const onPlayPause = () => {
    if (mixer.active().length === 0) return;
    if (mixer.playing) mixer.pause();
    else if (stripBlocked()) { lastTick.current = nowMs(); mixer.play(); }
    else setShowPaywall(true);
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
          <View style={styles.headerRight}>
          {premium ? (
            <View style={[styles.pill, { backgroundColor: 'rgba(52,211,153,0.2)' }]}>
              <Text style={[styles.pillText, { color: '#6ee7b7' }]}>Premium</Text>
            </View>
          ) : (
            <Pressable style={styles.pill} onPress={() => setShowPaywall(true)} accessibilityRole="button">
              <Text style={styles.pillText}>
                {remaining > 0 && countsTowardPreview(active, false) ? `Preview ${fmt(remaining)}` : 'Unlock all'}
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.gear}
            onPress={() => setShowSettings(true)}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
          >
            <Text style={styles.gearIcon}>⚙️</Text>
          </Pressable>
          </View>
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
            const locked = isLocked(item.id, premium);
            return (
              <Pressable
                onPress={() => onTile(item.id)}
                style={[styles.tile, on && styles.tileOn]}
                accessibilityRole="button"
                accessibilityLabel={locked ? `${item.name}, Premium` : item.name}
                accessibilityHint={item.description}
              >
                {locked ? (
                  <View style={styles.lock} testID={`premium-${item.id}`}>
                    <Text style={styles.lockText}>🔒 Premium</Text>
                  </View>
                ) : null}
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.tileName} numberOfLines={2}>{item.name}</Text>
                {item.headphones ? (
                  <View style={styles.badge} accessibilityLabel="Use headphones">
                    <Text style={styles.badgeText}>Use headphones</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />

        {QA_MODE && (qaLine || qaTimer) ? (
          <Text style={styles.qa} testID="qa-positions">{[qaLine, qaTimer].filter(Boolean).join('\n')}</Text>
        ) : null}

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
            <Text style={styles.sideLabel}>{timerPlan ? fmt(timerLeft) : allNight ? 'All night' : 'Timer'}</Text>
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
                  <View style={{ width: 130 }}>
                    <Text style={styles.mixName}>{SOUND_BY_ID[id].emoji} {SOUND_BY_ID[id].name}</Text>
                    {SOUND_BY_ID[id].headphones ? <Text style={styles.badgeInline}>Use headphones</Text> : null}
                  </View>
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
          <ScrollView style={{ maxHeight: 560 }}>
            {TIMER_OPTIONS.map((o) => (
              <Pressable
                key={o.label}
                style={styles.timerRow}
                onPress={() => {
                  applyTimer(o.minutes);
                  setShowTimer(false);
                }}
              >
                <Text style={styles.timerText}>{o.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Paywall */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => { setPremium(true); setShowPaywall(false); }}
        reduceMotion={reduceMotion}
      />

      {/* Settings sheet: Restore purchases lives here too, outside the paywall */}
      <Modal visible={showSettings} transparent animationType={sheetAnim} onRequestClose={() => setShowSettings(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowSettings(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Settings</Text>
          <Text style={[styles.sub, { marginBottom: 8 }]}>{premium ? 'Premium is active. Thank you.' : 'Rain, ocean, forest, fan, white and brown noise and 432 Hz Deep Sleep are free to play anytime.'}</Text>
          <Pressable style={styles.timerRow} onPress={() => runRestore(() => { setPremium(true); setShowSettings(false); })} accessibilityRole="button">
            <Text style={styles.timerText}>Restore purchases</Text>
          </Pressable>
          {!premium ? (
            <Pressable style={styles.timerRow} onPress={() => { setShowSettings(false); setShowPaywall(true); }} accessibilityRole="button">
              <Text style={styles.timerText}>Unlock all sounds</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.timerRow} onPress={() => Linking.openURL(TERMS_URL)}><Text style={styles.timerText}>Terms of Use</Text></Pressable>
          <Pressable style={styles.timerRow} onPress={() => Linking.openURL(PRIVACY_URL)}><Text style={styles.timerText}>Privacy Policy</Text></Pressable>
          <Pressable style={styles.timerRow} onPress={() => Linking.openURL(SUPPORT_URL)}><Text style={styles.timerText}>Support</Text></Pressable>
        </View>
      </Modal>
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

/** Restore purchases, shared by the paywall and the settings sheet. Runs only on a user tap. */
async function runRestore(onUnlocked: () => void, setBusy?: (b: boolean) => void) {
  setBusy?.(true);
  try {
    if (await restore()) onUnlocked();
    else Alert.alert('Nothing to restore', 'No active subscription was found for this account.');
  } catch (e: unknown) {
    Alert.alert('Restore failed', e instanceof Error ? e.message : 'Please try again.');
  } finally { setBusy?.(false); }
}

function Paywall({ visible, onClose, onUnlocked, reduceMotion }: {
  visible: boolean; onClose: () => void; onUnlocked: () => void; reduceMotion: boolean;
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

  const doRestore = () => runRestore(onUnlocked, setBusy);

  const periodLabel = (plan: Plan) => (plan.kind === 'yearly' ? 'year' : 'month');

  return (
    <Modal visible={visible} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose}>
      <LinearGradient colors={[C.bg1, C.bg2, C.bg3]} style={styles.fill}>
        <SafeAreaView style={[styles.fill, { padding: 24 }]}>
          <Pressable onPress={onClose} style={styles.close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close" testID="paywall-close">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 64, textAlign: 'center' }}>🌙</Text>
            <Text style={styles.payTitle}>{PAYWALL_TITLE}</Text>
            <Text style={styles.paySub}>{PAYWALL_SUB}</Text>
            {[`All ${SOUNDS.length} sleep sounds`, 'Lullabies, binaural tones and every nature scene', 'Layer any of them into your own mix'].map((t) => (
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
  badge: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(167,139,250,0.3)' },
  badgeText: { color: C.text, fontSize: 9, fontWeight: '700' },
  badgeInline: { color: C.sub, fontSize: 11, marginTop: 2 },
  lock: { position: 'absolute', top: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)' },
  lockText: { color: '#fde68a', fontSize: 9, fontWeight: '800' },
  gear: { marginLeft: 10, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  gearIcon: { fontSize: 18 },
  close: { alignSelf: 'flex-end', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  closeText: { color: C.text, fontSize: 20, fontWeight: '700' },
  qa: { position: 'absolute', top: 54, left: 12, right: 12, color: '#fde68a', fontSize: 11, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
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
