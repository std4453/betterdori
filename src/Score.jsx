import { makeStyles } from '@material-ui/styles';
import createTree from 'functional-red-black-tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import testScore from './assets/test_score.json';
import tools from './tools/config';
import { normalizeWheel } from './tools/utils';



const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: '11em',
        fontSize: `${470 / 11}px`,
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
    },
    inner: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 5000,
    },
});

const initialSettings = {
    // scale: 600,
    follow: false,
    progressOffset: 180,
    division: 2,
    scrollSpeed: 0.0012,
    scaleSpeed: 0.0003,
    initialScale: 600,
    minScale: 50,
    maxScale: 2000,
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
    const [division, setDivision] = useState(2);
    const settings = useMemo(() => ({
        ...initialSettings, division, setDivision,
    }), [division]);
    const params = {
        music, timers, setTimers, notes, setNotes, markers, setMarkers,
        ranges, time2Timers, time2Notes, time2Markers, settings,
        containerEl: root, innerEl: inner,
    };

    // scale = pixels per second
    const [scale, setScale] = useState(settings.initialScale);
    const onWheel = useCallback((e) => {
        if (!root) return;
        const { pixelY } = normalizeWheel(e.nativeEvent);
        if (e.ctrlKey) { // scaling
            const height = scale * music.duration;
            // scaling keeps the cursor unmoved, that is, 
            const ratio = (e.clientY + root.scrollTop) / height;
            // scale changes on a proportional basis, a same scroll distance
            // results in a same proportion of scale change.
            let newScale = scale * (1 - pixelY * settings.scaleSpeed);
            if (newScale < settings.minScale) newScale = settings.minScale;
            if (newScale > settings.maxScale) newScale = settings.maxScale;
            const newHeight = newScale * music.duration;
            let newScroll = ratio * newHeight - e.clientY;
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > newHeight) newScroll = newHeight - window.innerHeight;
            root.scrollTop = newScroll;
            setScale(newScale);
        } else {
            const height = scale * music.duration;
            // scroll changes proportional to scale, a same scroll distance
            // results in a same scroll change measured in *beats*. 
            let newScroll = root.scrollTop + pixelY * settings.scrollSpeed * scale;
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > height) newScroll = height - window.innerHeight;
            root.scrollTop = newScroll;
        }
    }, [root, scale, music, settings]);
    // prevent default ctrl+wheel zoom, for details about the { passive: false } option
    // in addEventListener, see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    useEffect(() => {
        const prevent = (e) => {
            if (!e.ctrlKey) return;
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        window.addEventListener('wheel', prevent, { passive: false });
        return () => window.removeEventListener('wheel', prevent);
    }, []);

    // jump to scroll bottom initially, use getBoundingClientRect() so that this
    // will run only once, upon mounting (instead of every time scale changes).
    useEffect(() => {
        if (!inner || !root) return;
        const { height } = inner.getBoundingClientRect();
        root.scrollTop = height - window.innerHeight;
    }, [inner, root]);

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return (
        <div
            ref={setRoot}
            className={classes.root}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            <div
                ref={setInner}
                style={{ height: music.duration * scale }}
                className={classes.inner}>
                {tools.map((Component, i) => (
                    <Component key={i} {...params}/>
                ))}
            </div>
        </div>
    );
};

export default Score;
