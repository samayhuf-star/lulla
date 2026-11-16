import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SOUND_BY_ID } from './catalog';
import { mixer } from './mixer';
import { blockedInMix } from './access';
import { remainingSeconds } from './trial';
import { MAX_SCENES, PRESET_ARCS, addScene, arcAt, nextMinutes, removeScene, totalMinutes, type Scene } from './arc';
import { loadMixes } from './nightsStore';
import type { SavedMix } from './mixesLogic';

const C = { text: '#f5f3ff', sub: '#c4b5fd', accent2: '#7c3aed', card: 'rgba(255,255,255,0.08)', sheet: '#1d0f3d' };

const fmt = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return `${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${String(r).padStart(2, '0')}`;
};

/** Bedtime routine: pick a preset, or chain your own saved nights, then it plays on its own. */
export function NightArcModal({ visible, premium, onClose, onMixChanged }: {
  visible: boolean; premium: boolean; onClose: () => void; onMixChanged: () => void;
}) {
  const [scenes, setScenes] = useState<Scene[]>(PRESET_ARCS[0].scenes);
  const [saved, setSaved] = useState<SavedMix[]>([]);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState({ index: 0, leftMs: 0 });
  const startedAt = useRef(0);
  const appliedIndex = useRef(-1);
  const premiumRef = useRef(premium);
  useEffect(() => { premiumRef.current = premium; }, [premium]);

  useEffect(() => { if (visible) loadMixes().then(setSaved); }, [visible]);

  const applyScene = (sc: Scene) => {
    mixer.clear();
    const ids = sc.items.map((i) => i.id);
    const blocked = new Set(blockedInMix(ids, { premium: premiumRef.current, previewLeft: remainingSeconds() }));
    sc.items.filter((i) => !blocked.has(i.id)).forEach((i) => { mixer.toggle(i.id); mixer.setVolume(i.id, i.vol); });
    if (mixer.active().length) mixer.play();
    onMixChanged();
  };

  const stop = (finished: boolean) => {
    setRunning(false);
    appliedIndex.current = -1;
    if (finished) mixer.pause();
    mixer.setMaster(1);
    onMixChanged();
  };

  const begin = () => {
    if (scenes.length === 0) return;
    appliedIndex.current = -1;
    startedAt.current = Date.now();
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const st = arcAt(scenes, Date.now() - startedAt.current);
      if (st.done) { stop(true); return; }
      if (st.index !== appliedIndex.current) { appliedIndex.current = st.index; applyScene(scenes[st.index]); }
      mixer.setMaster(st.gain);
      setState({ index: st.index, leftMs: st.leftMs });
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, scenes]);

  const close = () => { if (running) stop(false); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={s.full}>
        <View style={s.head}>
          <Text style={s.h1}>Night arc</Text>
          <Pressable onPress={close} style={s.close} accessibilityRole="button" accessibilityLabel="Close"><Text style={s.closeText}>✕</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {!running ? (
            <>
              <Text style={s.sub}>A bedtime routine that plays by itself: each scene has its own sounds and length, they blend one into the next, and the last one fades to silence.</Text>
              <Text style={s.label}>Start from a routine</Text>
              {PRESET_ARCS.map((a) => (
                <Pressable key={a.id} style={s.item} onPress={() => setScenes(a.scenes)} accessibilityRole="button" accessibilityLabel={`Use ${a.name}`}>
                  <Text style={s.itemName}>{a.name}</Text><Text style={s.hint}>{a.blurb}</Text>
                </Pressable>
              ))}
              <Text style={s.label}>Your routine · {totalMinutes(scenes)} min</Text>
              {scenes.length === 0 ? <Text style={s.hint}>Add a scene below.</Text> : scenes.map((sc, i) => (
                <View key={`${sc.name}${i}`} style={s.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>{i + 1}. {sc.name}</Text>
                    <Text style={s.hint}>{sc.items.map((x) => SOUND_BY_ID[x.id]?.emoji).join(' ')}</Text>
                  </View>
                  <Pressable style={s.pill} onPress={() => setScenes(scenes.map((x, k) => (k === i ? { ...x, minutes: nextMinutes(x.minutes) } : x)))} accessibilityRole="button" accessibilityLabel={`${sc.minutes} minutes, tap to change`}>
                    <Text style={s.pillText}>{sc.minutes} min</Text>
                  </Pressable>
                  <Pressable style={s.close} onPress={() => setScenes(removeScene(scenes, i))} accessibilityRole="button" accessibilityLabel={`Remove scene ${i + 1}`}><Text style={s.closeText}>✕</Text></Pressable>
                </View>
              ))}
              <Text style={s.label}>Add one of My nights{scenes.length >= MAX_SCENES ? ' (limit reached)' : ''}</Text>
              {saved.length === 0 ? <Text style={s.hint}>Save mixes in My nights and they show up here.</Text> : saved.map((m) => (
                <Pressable key={m.id} style={s.item} onPress={() => setScenes(addScene(scenes, { name: m.name, items: m.items, minutes: 15 }))} accessibilityRole="button" accessibilityLabel={`Add ${m.name}`}>
                  <Text style={s.itemName}>＋ {m.name}</Text>
                </Pressable>
              ))}
              <Pressable style={[s.cta, scenes.length === 0 && { opacity: 0.4 }]} onPress={begin} accessibilityRole="button"><Text style={s.ctaText}>Start tonight&apos;s routine</Text></Pressable>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={s.hint}>Scene {state.index + 1} of {scenes.length}</Text>
              <Text style={s.big}>{scenes[state.index]?.name}</Text>
              <Text style={s.count}>{fmt(state.leftMs)}</Text>
              <Text style={s.hint}>left in tonight&apos;s routine</Text>
              <Pressable style={s.ghost} onPress={() => stop(false)} accessibilityRole="button"><Text style={s.ctaText}>Stop</Text></Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  full: { flex: 1, backgroundColor: C.sheet },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  h1: { color: C.text, fontSize: 24, fontWeight: '700' },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: C.sub, fontSize: 18 },
  sub: { color: C.sub, fontSize: 14, lineHeight: 20 },
  label: { color: C.text, fontSize: 16, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  hint: { color: C.sub, fontSize: 13, lineHeight: 18, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 14, backgroundColor: C.card },
  itemName: { color: C.text, fontSize: 16, fontWeight: '600' },
  pill: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 22, backgroundColor: 'rgba(167,139,250,0.25)', marginRight: 4 },
  pillText: { color: C.text, fontSize: 14 },
  cta: { marginTop: 24, minHeight: 52, borderRadius: 26, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  big: { color: C.text, fontSize: 30, fontWeight: '700', marginTop: 8 },
  count: { color: C.sub, fontSize: 56, fontWeight: '300', marginTop: 16 },
  ghost: { marginTop: 36, minHeight: 48, paddingHorizontal: 32, justifyContent: 'center', borderRadius: 24, backgroundColor: C.card },
});
