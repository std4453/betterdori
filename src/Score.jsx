import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import createTree from 'functional-red-black-tree';
import Bars from './Bars';
import { compileSong } from './Song';
import Notes from './Notes';
import SoundFX from './SoundFX';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: 470,
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
    caret: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 0,
        borderBottom: '3px solid #ff4e67',
        marginTop: -1.5,
    },
    progress: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 0,
        borderBottom: '3px solid #FFF',
        marginTop: -1.5,
    },
    notesCounter: {
        position: 'absolute',
        left: 0,
        top: 0,
        margin: 10,
        fontSize: 18,
        color: '#FFF',
    },
});

const scale = 600;
const caretOffset = 180;

function Score({ song, setSong }) {
    const classes = useStyles();
    const { music } = song;
    const compiled = useMemo(() => compileSong(song), [song]);
    const notesIndex = useMemo(() => {
        let tree = createTree(), totalNotes = 0;
        for (const { time, lanes } of compiled.notes) {
            totalNotes += lanes.filter(slot => typeof slot !== 'undefined').length;
            tree = tree.insert(time, totalNotes);
        }
        return tree;
    }, [compiled]);
    const rangesIndex = useMemo(() => {
        let tree = createTree();
        for (const { bpm, time } of compiled.ranges) {
            tree = tree.insert(time, bpm);
        }
        return tree;
    }, [compiled]);
    
    const [root, setRoot] = useState(null);
    const [caret, setCaret] = useState(null);

    const updateCaret = useCallback(() => {
        const height = music.duration * scale;
        const progress = music.currentTime / music.duration;
        const caretPosition = (1 - progress) * height;
    
        let viewTop = caretPosition + caretOffset - window.innerHeight;
        // keep caret in view, but not exceeding score boundaries
        if (viewTop < 0) viewTop = 0;
        else if (caretPosition + caretOffset > height) viewTop = height - window.innerHeight;
        
        if (root) root.scrollTop = viewTop;
        if (caret) caret.style.top = `${caretPosition}px`;
    }, [root, caret, music]);
    const onFrame = useCallback(() => music.paused || updateCaret(), [music, updateCaret]);
    useEffect(() => {
        let valid = true;
        const onFrameWrapped = () => {
            onFrame();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [onFrame]);
    useEffect(updateCaret, [caret]);

    const [progress, setProgress] = useState(null);
    const [inner, setInner] = useState(null);
    const [notesCounter, setNotesCounter] = useState(null);
    const updateProgress = useCallback((e) => {
        if (!progress || !inner || !notesCounter) return;
        const { y, height } = inner.getBoundingClientRect();
        const top = e.clientY - y;
        progress.style.top = `${top}px`;
        const time = (1 - top / height) * music.duration;
        const notesCount = notesIndex.le(time).value;
        notesCounter.innerHTML = `${notesCount}`;
    }, [progress, inner, music, notesCounter, notesIndex]);
    useEffect(() => {
        if (!inner) return;
        inner.addEventListener('mousemove', updateProgress);
        return () => inner.removeEventListener('mousemove', updateProgress);
    }, [inner, updateProgress]);

    return (
        <div ref={setRoot} className={classes.root}>
            <div ref={setInner} style={{ height: music.duration * scale }} className={classes.inner}>
                <Bars compiled={compiled} division={2}/>
                <Notes compiled={compiled}/>
                <SoundFX compiled={compiled}/>
                <div ref={setCaret} className={classes.caret}/>
                <div ref={setProgress} className={classes.progress}>
                    <div ref={setNotesCounter} className={classes.notesCounter}/>
                </div>
            </div>
        </div>
    );
};

export default Score;
