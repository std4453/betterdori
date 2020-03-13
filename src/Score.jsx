import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import Bars from './Bars';
import { compileSong } from './Song';
import Notes from './Notes';

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

function Score({ song, setSong }) {
    const classes = useStyles();
    const { music } = song;
    const compiled = useMemo(() => compileSong(song), [song]);
    
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

    return (
        <div ref={setRoot} className={classes.root}>
            <div style={{ height: music.duration * scale }} className={classes.inner}>
                <Bars compiled={compiled} division={2}/>
                <Notes compiled={compiled}/>
                <div ref={setCaret} className={classes.caret}/>
            </div>
        </div>
    );
};

export default Score;
