import React, { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import createTree from 'functional-red-black-tree';

import { Tools } from './tools/Tool';
import tools from './tools/config';

import testScore from './assets/test_score.json';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: 470,
        fontSize: `${470 / 11}px`,
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'auto',
    },
    inner: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 5000,
    },
});

const settings = {
    scale: 600,
    follow: false,
    progressOffset: 180,
    division: 2,
};

function Score({ music }) {
    const classes = useStyles();

    const initialChart = testScore;
    const initialTimers = useMemo(() => {
        let res = createTree();
        for (const { type, cmd, beat, bpm } of initialChart) {
            if (type !== 'System' || cmd !== 'BPM') continue;
            res = res.insert(beat, { bpm });
        }
        return res;
    }, [initialChart]);
    const initialNotes = useMemo(() => {
        let res = createTree();
        for (const { type, beat, lane, ...rest } of initialChart) {
            if (type !== 'Note') continue;
            res = res.insert(beat, { ...rest, lane: lane - 1 });
        }
        return res;
    }, [initialChart]);
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

    const [root, setRoot] = useState(null);
    const [inner, setInner] = useState(null);
    const params = {
        music, timers, setTimers, notes, setNotes, markers, setMarkers,
        ranges, time2Timers, time2Notes, time2Markers, settings,
        containerEl: root, innerEl: inner,
    };

    return (
        <div ref={setRoot} className={classes.root}>
            <div
                ref={setInner}
                style={{ height: music.duration * settings.scale }}
                className={classes.inner}>
                <Tools>
                    {tools.map((Component, i) => (
                        <Component key={i} {...params}/>
                    ))}
                </Tools>
            </div>
        </div>
    );
};

export default Score;
