import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { SOUND_BY_ID } from './catalog';
import { mixer } from './mixer';
import { blockedInMix } from './access';
import { remainingSeconds } from './trial';
import {
  DEFAULT_RITUAL_SOUND, HANDOFF_TIMER_MINUTES, PATTERNS, PHASE_LABEL, RITUAL_MINUTES, patternById, phaseAt,
  ritualDone, ritualGain,
} from './ritual';
import { MAX_NAME, addMix, removeMix, type SavedMix } from './mixesLogic';
import { dayKey, logEntry, weekSummary, type Ease, type Entry } from './journalLogic';
import { loadJournal, loadMixes, saveJournal, saveMixes } from './nightsStore';

const C = { text: '#f5f3ff', sub: '#c4b5fd', accent: '#a78bfa', accent2: '#7c3aed', card: 'rgba(255,255,255,0.08)', sheet: '#1d0f3d' };

interface Props {
  premium: boolean;
  reduceMotion: boolean;
  /** Starts the sleep timer for this many minutes (same path as the timer sheet). */
  onStartTimer: (minutes: number) => void;
  /** Called when the mix has changed because a saved night was applied. */
  onMixChanged: () => void;
}

/** Home card with the three things only Lulla does: wind-down ritual, saved nights, sleep journal. */
export function WindDown({ premium, reduceMotion, onStartTimer, onMixChanged }: Props) {
  const [open, setOpen] = useState<null | 'ritual' | 'nights' | 'journal'>(null);
  return (
    <View style={s.card} testID="winddown-card">
      <Text style={s.title}>Tonight</Text>
      <Text style={s.sub}>Wind down with your breath, save the mixes that work, and see how you slept.</Text>
      <View style={s.row}>
        <Btn label="🫁 Wind-down" hint="Guided breathing with your sounds" onPress={() => setOpen('ritual')} />
        <Btn label="🌙 My nights" hint="Saved sound mixes" onPress={() => setOpen('nights')} />
        <Btn label="📓 Journal" hint="How you slept this week" onPress={() => setOpen('journal')} />
      </View>
      <RitualModal
        visible={open === 'ritual'} premium={premium} reduceMotion={reduceMotion}
        onClose={() => setOpen(null)} onStartTimer={onStartTimer}
      />
      <NightsModal
        visible={open === 'nights'} premium={premium}
        onClose={() => setOpen(null)} onMixChanged={onMixChanged}
      />
      <JournalModal visible={open === 'journal'} onClose={() => setOpen(null)} />
    </View>
  );
}

function Btn({ label, hint, onPress }: { label: string; hint: string; onPress: () => void }) {
  return (
    <Pressable style={s.btn} onPress={onPress} accessibilityRole="button" accessibilityLabel={label.replace(/^\S+\s/, '')} accessibilityHint={hint}>
      <Text style={s.btnText} maxFontSizeMultiplier={1.3}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.chip, on && s.chipOn]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }}>
      <Text style={s.chipText}>{label}</Text>
    </Pressable>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <View style={s.full}>
      <View style={s.head}>
        <Text style={s.h1}>{title}</Text>
        <Pressable onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={s.closeText}>✕</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>{children}</ScrollView>
    </View>
  );
}

/* ------------------------------- Wind-down ritual ------------------------------- */

function RitualModal({ visible, premium, reduceMotion, onClose, onStartTimer }: {
  visible: boolean; premium: boolean; reduceMotion: boolean; onClose: () => void; onStartTimer: (m: number) => void;
}) {
  const [patternId, setPatternId] = useState('calm');
  const [minutes, setMinutes] = useState<number>(5);
  const [handoff, setHandoff] = useState<number>(60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const finished = useRef(false);

  const pattern = patternById(patternId);
  const st = phaseAt(pattern, elapsed);

  const finish = (completed: boolean) => {
    if (finished.current) return;
    finished.current = true;
    setRunning(false);
    mixer.setMaster(1);
    if (completed) {
      onStartTimer(handoff);
      if (!reduceMotion) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    onClose();
  };

  const begin = () => {
    if (mixer.active().length === 0) mixer.toggle(DEFAULT_RITUAL_SOUND);
    const ids = mixer.active();
    const blocked = blockedInMix(ids, { premium, previewLeft: remainingSeconds() });
    if (blocked.length === ids.length) { blocked.forEach((id) => mixer.toggle(id)); mixer.toggle(DEFAULT_RITUAL_SOUND); }
    else blocked.forEach((id) => mixer.toggle(id));
    mixer.play();
    finished.current = false;
    startedAt.current = Date.now();
    setElapsed(0);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const e = Date.now() - startedAt.current;
      setElapsed(e);
      mixer.setMaster(ritualGain(phaseAt(pattern, e).fullness));
      if (ritualDone(e, minutes)) finish(true);
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, patternId, minutes, handoff]);

  const size = reduceMotion ? 200 : 120 + 120 * st.fullness;
  const left = Math.max(0, minutes * 60 - Math.floor(elapsed / 1000));
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return (
    <Modal visible={visible} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={() => (running ? finish(false) : onClose())}>
      <Sheet title="Wind-down" onClose={() => (running ? finish(false) : onClose())}>
        {!running ? (
          <>
            <Text style={s.sub}>Your sounds play while a gentle pacer guides your breathing. The volume swells softly as you breathe in and ebbs as you breathe out. When it ends, your sleep timer starts.</Text>
            <Text style={s.label}>Breathing</Text>
            <View style={s.wrap}>{PATTERNS.map((p) => <Chip key={p.id} label={p.name} on={p.id === patternId} onPress={() => setPatternId(p.id)} />)}</View>
            <Text style={s.hint}>{pattern.blurb}</Text>
            <Text style={s.label}>Length</Text>
            <View style={s.wrap}>{RITUAL_MINUTES.map((m) => <Chip key={m} label={`${m} min`} on={m === minutes} onPress={() => setMinutes(m)} />)}</View>
            <Text style={s.label}>Then sleep timer</Text>
            <View style={s.wrap}>{HANDOFF_TIMER_MINUTES.map((m) => <Chip key={m} label={m >= 60 ? `${m / 60} h` : `${m} min`} on={m === handoff} onPress={() => setHandoff(m)} />)}</View>
            <Text style={s.hint}>
              {mixer.active().length ? `Using your current mix (${mixer.active().length}).` : `No sounds picked yet, so ${SOUND_BY_ID[DEFAULT_RITUAL_SOUND].name} will play.`}
            </Text>
            <Pressable style={s.cta} onPress={begin} accessibilityRole="button"><Text style={s.ctaText}>Begin</Text></Pressable>
          </>
        ) : (
          <View style={s.center}>
            <View style={[s.orb, { width: size, height: size, borderRadius: size / 2 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
            <Text style={s.phase} accessibilityLiveRegion="polite">{PHASE_LABEL[st.phase]}</Text>
            <Text style={s.count}>{st.secondsLeft}</Text>
            <Text style={s.hint}>{mm} left · {st.breaths} breaths</Text>
            <Pressable style={s.ghost} onPress={() => finish(false)} accessibilityRole="button"><Text style={s.ghostText}>Stop</Text></Pressable>
          </View>
        )}
      </Sheet>
    </Modal>
  );
}

/* --------------------------------- My nights --------------------------------- */

function NightsModal({ visible, premium, onClose, onMixChanged }: {
  visible: boolean; premium: boolean; onClose: () => void; onMixChanged: () => void;
}) {
  const [list, setList] = useState<SavedMix[]>([]);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { if (visible) loadMixes().then(setList); }, [visible]);

  const current = mixer.active();
  const save = () => {
    const next = addMix(list, name, current.map((id) => ({ id, vol: mixer.volume(id) })), Date.now());
    setList(next); saveMixes(next); setName(''); setNote('Saved.');
  };
  const apply = (m: SavedMix) => {
    mixer.clear();
    const ids = m.items.map((i) => i.id);
    const blocked = new Set(blockedInMix(ids, { premium, previewLeft: remainingSeconds() }));
    m.items.filter((i) => !blocked.has(i.id)).forEach((i) => { mixer.toggle(i.id); mixer.setVolume(i.id, i.vol); });
    if (mixer.active().length) mixer.play();
    setNote(blocked.size ? `${blocked.size} Premium sound${blocked.size > 1 ? 's' : ''} skipped.` : 'Playing.');
    onMixChanged();
    if (mixer.active().length) onClose();
  };
  const del = (id: string) => { const next = removeMix(list, id); setList(next); saveMixes(next); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Sheet title="My nights" onClose={onClose}>
        <Text style={s.sub}>Save a mix you love, with the volume of each sound, and bring it back with one tap.</Text>
        <Text style={s.label}>Save the current mix{current.length ? ` (${current.length} sounds)` : ''}</Text>
        {current.length === 0 ? (
          <Text style={s.hint}>Pick some sounds on the home screen first.</Text>
        ) : (
          <View style={s.saveRow}>
            <TextInput
              style={s.input} value={name} onChangeText={setName} maxLength={MAX_NAME}
              placeholder="Name (e.g. Rainy cabin)" placeholderTextColor="#8b7fb8"
              accessibilityLabel="Name for this mix" returnKeyType="done" onSubmitEditing={save}
            />
            <Pressable style={s.saveBtn} onPress={save} accessibilityRole="button"><Text style={s.ctaText}>Save</Text></Pressable>
          </View>
        )}
        {note ? <Text style={s.hint}>{note}</Text> : null}
        <Text style={s.label}>Saved</Text>
        {list.length === 0 ? <Text style={s.hint}>Nothing saved yet.</Text> : list.map((m) => (
          <View key={m.id} style={s.item}>
            <Pressable style={{ flex: 1 }} onPress={() => apply(m)} accessibilityRole="button" accessibilityLabel={`Play ${m.name}`}>
              <Text style={s.itemName}>{m.name}</Text>
              <Text style={s.hint}>{m.items.map((i) => SOUND_BY_ID[i.id]?.emoji).join(' ')}</Text>
            </Pressable>
            <Pressable onPress={() => del(m.id)} style={s.del} accessibilityRole="button" accessibilityLabel={`Delete ${m.name}`}><Text style={s.closeText}>✕</Text></Pressable>
          </View>
        ))}
      </Sheet>
    </Modal>
  );
}

/* --------------------------------- Journal --------------------------------- */

const EASE: { id: Ease; label: string }[] = [{ id: 'fast', label: 'Fell asleep fast' }, { id: 'okay', label: 'About normal' }, { id: 'slow', label: 'Took a while' }];

function JournalModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [rested, setRested] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [ease, setEase] = useState<Ease>('okay');
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (visible) loadJournal().then(setEntries); }, [visible]);

  const today = new Date();
  const week = weekSummary(entries, today);
  const log = () => {
    const first = mixer.active()[0];
    const e: Entry = { day: dayKey(today), rested, ease, mixName: first ? SOUND_BY_ID[first]?.name : undefined };
    const next = logEntry(entries, e);
    setEntries(next); saveJournal(next); setSaved(true);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Sheet title="Sleep journal" onClose={onClose}>
        <Text style={s.sub}>A ten-second check-in. Your answers stay on this phone.</Text>
        <Text style={s.label}>How rested do you feel?</Text>
        <View style={s.wrap}>
          {([1, 2, 3, 4, 5] as const).map((n) => <Chip key={n} label={['😫', '😕', '😐', '🙂', '😄'][n - 1]} on={n === rested} onPress={() => { setRested(n); setSaved(false); }} />)}
        </View>
        <Text style={s.label}>Getting to sleep</Text>
        <View style={s.wrap}>{EASE.map((x) => <Chip key={x.id} label={x.label} on={x.id === ease} onPress={() => { setEase(x.id); setSaved(false); }} />)}</View>
        <Pressable style={s.cta} onPress={log} accessibilityRole="button"><Text style={s.ctaText}>{saved ? 'Saved ✓' : 'Save today'}</Text></Pressable>

        <Text style={s.label}>This week</Text>
        <View style={s.bars} accessibilityLabel={`Rested ratings for the last 7 days. ${week.logged} logged.`}>
          {week.days.map((d) => (
            <View key={d.day} style={s.barCol}>
              <View style={[s.bar, { height: 8 + (d.rested ?? 0) * 14, opacity: d.rested ? 1 : 0.25 }]} />
              <Text style={s.barDay}>{d.day.slice(8)}</Text>
            </View>
          ))}
        </View>
        <Text style={s.hint}>
          {week.logged ? `${week.logged} of 7 days logged · average ${week.avgRested} / 5` : 'No entries this week yet.'}
          {week.topMix ? `\nYou felt most rested after: ${week.topMix}.` : ''}
        </Text>
        <Text style={[s.hint, { marginTop: 12 }]}>This is a personal log, not medical advice.</Text>
      </Sheet>
    </Modal>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 12, marginBottom: 12, padding: 14, borderRadius: 18, backgroundColor: C.card },
  title: { color: C.text, fontSize: 18, fontWeight: '700' },
  sub: { color: C.sub, fontSize: 14, lineHeight: 20, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  btn: { flexGrow: 1, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(167,139,250,0.25)', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: C.text, fontWeight: '600', fontSize: 14 },
  chip: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, backgroundColor: C.card, justifyContent: 'center' },
  chipOn: { backgroundColor: C.accent2 },
  chipText: { color: C.text, fontSize: 15 },
  full: { flex: 1, backgroundColor: C.sheet },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  h1: { color: C.text, fontSize: 24, fontWeight: '700' },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: C.sub, fontSize: 18 },
  label: { color: C.text, fontSize: 16, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  hint: { color: C.sub, fontSize: 13, lineHeight: 18, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cta: { marginTop: 24, minHeight: 52, borderRadius: 26, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  center: { alignItems: 'center', paddingTop: 24 },
  orb: { backgroundColor: 'rgba(167,139,250,0.55)', borderWidth: 2, borderColor: C.accent, marginVertical: 40 },
  phase: { color: C.text, fontSize: 28, fontWeight: '700' },
  count: { color: C.sub, fontSize: 56, fontWeight: '300', marginTop: 4 },
  ghost: { marginTop: 36, minHeight: 44, paddingHorizontal: 28, justifyContent: 'center', borderRadius: 22, backgroundColor: C.card },
  ghostText: { color: C.text, fontSize: 16 },
  saveRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, minHeight: 48, borderRadius: 12, paddingHorizontal: 12, color: C.text, backgroundColor: C.card, fontSize: 16 },
  saveBtn: { minHeight: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: C.accent2, justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderRadius: 14, backgroundColor: C.card },
  itemName: { color: C.text, fontSize: 16, fontWeight: '600' },
  del: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginTop: 4 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 22, borderRadius: 6, backgroundColor: C.accent },
  barDay: { color: C.sub, fontSize: 11, marginTop: 4 },
});
