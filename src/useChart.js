import { useMemo, useState, useCallback } from 'react';
import createTree from 'functional-red-black-tree';
import testScore from './assets/test_score.json';

const initial = {
    score: testScore,

    // initial values
    follow: false,
    division: 2,
    scale: 600,

    // other settings
    progressOffset: 180,
    scrollSpeed: 0.03,
    scaleSpeed: 0.0005,
    minScale: 50,
    maxScale: 2000,
};

function useChart(music) {
    const initialTimers = useMemo(() => {
        let res = createTree();
        for (const { type, cmd, beat, bpm } of initial.score) {
            if (type !== 'System' || cmd !== 'BPM') continue;
            res = res.insert(beat, { bpm });
        }
        return res;
    }, []);
    const initialNotes = useMemo(() => {
        let res = createTree();
        for (const { type, beat, lane, ...rest } of initial.score) {
            if (type !== 'Note') continue;
            res = res.insert(beat, { ...rest, lane: lane - 1 });
        }
        return res;
    }, []);
    const [timers, setTimers] = useState(initialTimers);
    const [notes, setNotes] = useState(initialNotes);
    const [markers, setMarkers] = useState(createTree());
    
    const ranges = useMemo(() => {
        const res = [];
        let lastTime = 0;
        for (let it1 = timers.begin, it2 = timers.at(1); it1.hasNext; it1.next(), it2.next()) {
            const { key: beat1, value: { bpm } } = it1, { key: beat2 } = it2;
            const time1 = lastTime, time2 = lastTime + (beat2 - beat1) / bpm * 60;
            res.push({ time1, time2, beat1, beat2, bpm });
            lastTime = time2;
        }
        const { key: beat1, value: { bpm } } = timers.end;
        res.push({
            time1: lastTime, time2: music.duration,
            beat1, beat2: (music.duration - lastTime) / 60 * bpm + beat1, bpm
        });
        return res;
    }, [timers, music]);
    const time2Timers = useMemo(() => {
        let res = createTree();
        for (const { time1: time, beat1: beat, bpm } of ranges) {
            res = res.insert(time, { beat, bpm });
        }
        res = res.insert(ranges[ranges.length - 1].time2, { beat: ranges[ranges.length - 1].beat2 });
        return res;
    }, [ranges]);
    const time2Notes = useMemo(() => {
        let res = createTree();
        for (const { beat1, beat2, time1, bpm } of ranges) {
            // eslint-disable-next-line no-loop-func
            notes.forEach((beat, note) => {
                const time = (beat - beat1) / bpm * 60 + time1;
                res = res.insert(time, { ...note, beat });
            }, beat1, beat2);
        }
        return res;
    }, [ranges, notes]);
    const time2Markers = useMemo(() => {
        let res = createTree();
        for (const { beat1, beat2, time1, bpm } of ranges) {
            // eslint-disable-next-line no-loop-func
            markers.forEach((beat, marker) => {
                const time = (beat - beat1) / bpm * 60 + time1;
                res = res.insert(time, { ...marker, beat });
            }, beat1, beat2);
        }
        return res;
    }, [ranges, markers]);

    const [division, setDivision] = useState(initial.division);
    const [follow, setFollow] = useState(initial.follow);
    const [scale, setScale] = useState(initial.scale);

    const quantize = useCallback((time) => {
        const { key: rangeStartTime, value: { bpm, beat: rangeStartBeat } } = time2Timers.le(time);
        const { value: { beat: rangeEndBeat } } = time2Timers.gt(time);
        let quantizedBeat = rangeStartBeat + Math.round(
            (time - rangeStartTime) / 60 * bpm * division
        ) / division;
        // if quantized result exceeds the previous range, it falls on the beginning
        // of the next range instead
        if (quantizedBeat > rangeEndBeat) quantizedBeat = rangeEndBeat;
        const quantizedTime = rangeStartTime + (quantizedBeat - rangeStartBeat) / bpm * 60;
        const delta = Math.abs(quantizedTime - time) / 60 * bpm * division;
        return { beat: quantizedBeat, time: quantizedTime, bpm, delta };
    }, [division, time2Timers]);
    const countNotes = useCallback((time) => {
        const { valid, index } = time2Notes.le(time);
        // an invalid iterator with index = size - 1 is returned if the
        // key is smaller than the smallest key. index + 1 since we want to
        // disolay the number of notes *including* this one.
        return valid ? index + 1 : 0;
    }, [time2Notes]);
    const findNotePure = useCallback((notes, beat, lane) => {
        for (const it = notes.ge(beat); it.valid && it.key === beat; it.next()) {
            if (it.value.lane !== lane) continue;
            return it;
        }
        return null;
    }, []);
    const findNote = useCallback((beat, lane) => findNotePure(notes, beat, lane), [findNotePure, notes]);
    const forEachNote = useCallback((visit, filter) => {
        time2Notes.forEach((time, note) => {
            if (filter) {
                for (const key in filter) {
                    if (filter[key] !== note[key]) return;
                }
                visit(time, note);
            }
        });
    }, [time2Notes]);
    const forEachGroup = useCallback((visit) => {
        for (let it = time2Notes.begin; it.valid;) {
            const { key: time } = it;
            const notes = [];
            do {
                notes.push(it.value);
                it.next();
            } while (it.key <= time && it.valid);
            visit(time, notes);
        }
    }, [time2Notes]);
    const scaleX = 8;
    const matchNotePure = useCallback((notes, time2Timers, time, lane, threshold) => {
        const { key: startTime, value: { beat: startBeat, bpm } } = time2Timers.le(time);
        const beat = startBeat + (time - startTime) / 60 * bpm; 
        let minDist = threshold * threshold, minBeat, minLane = NaN;
        notes.forEach((noteBeat, { lane: noteLane }) => {
            const dist = Math.pow((noteLane - lane) / scaleX, 2) + Math.pow(noteBeat - beat, 2);
            if (dist < minDist) {
                minDist = dist;
                minBeat = noteBeat;
                minLane = noteLane;
            }
        }, beat - threshold, beat + threshold);
        if (isNaN(minLane)) return null;
        else return { beat: minBeat, lane: minLane };
    }, []);
    const matchNote = useCallback((time, lane, threshold) =>
        matchNotePure(notes, time2Timers, time, lane, threshold),
        [matchNotePure, notes, time2Timers]);

    const params = {
        music, timers, setTimers, notes, setNotes, markers, setMarkers,
        ranges, time2Timers, time2Notes, time2Markers,
        ...initial, division, setDivision, follow, setFollow, scale, setScale,
        quantize, countNotes, findNotePure, findNote, forEachNote, forEachGroup, matchNotePure, matchNote,
    };

    return params;
};

export default useChart;
