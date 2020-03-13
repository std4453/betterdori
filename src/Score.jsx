import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import Bars from './Bars';

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
    },
});

const scale = 400;
const caretOffset = 180;

function Score({ data: { music, notes }, setData }) {
    const classes = useStyles();
    const [duration, setDuration] = useState(10.0);
    useEffect(() => {
        const onDurationChange = () => setDuration(music.duration);
        music.addEventListener('durationchange', onDurationChange);
        return () => music.removeEventListener('durationchange', onDurationChange);
    }, [music]);
    
    const [root, setRoot] = useState(null);
    const [caret, setCaret] = useState(null);
    const onFrame = useCallback(() => {
        if (music.paused) return;

        const height = duration * scale;
        const progress = music.currentTime / duration;
        const caretPosition = (1 - progress) * height;

        let viewTop = caretPosition + caretOffset - window.innerHeight;
        // keep caret in view, but not exceeding score boundaries
        if (viewTop < 0) viewTop = 0;
        else if (caretPosition + caretOffset > height) viewTop = height - window.innerHeight;
        
        if (root) root.scrollTop = viewTop;
        if (caret) caret.style.top = `${caretPosition}px`;
    }, [root, music, duration, caret]);
    useEffect(() => {
        let valid = true;
        const onFrameWrapped = () => {
            onFrame();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [onFrame]);

    return (
        <div ref={setRoot} className={classes.root}>
            <div style={{ height: duration * scale }} className={classes.inner}>
                <Bars notes={notes} duration={duration} division={2}/>
                <div ref={setCaret} className={classes.caret}/>
            </div>
        </div>
    );
};

export default Score;
