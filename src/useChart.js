import { useMemo, useState } from 'react';
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

    const [containerEl, setContainerEl] = useState(null);
    const [innerEl, setInnerEl] = useState(null);
    const params = {
        music, timers, setTimers, notes, setNotes, markers, setMarkers,
        ranges, time2Timers, time2Notes, time2Markers,
        containerEl, setContainerEl, innerEl, setInnerEl,
        ...initial, division, setDivision, follow, setFollow, scale, setScale,
    };

    return params;
};

export default useChart;
