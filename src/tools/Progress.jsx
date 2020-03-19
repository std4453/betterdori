import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useEvent from '../hooks/useEvent';
import useFrame from '../hooks/useFrame';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 0,
        borderBottom: '3px solid #ff4e67',
        marginTop: -1.5,
    },
});

function Progress({
    music, innerEl, follow, progressOffset, code, keepInView, inflate,
}) {
    const classes = useStyles();

    const [progressEl, setProgressEl] = useState(null);
    const updateProgress = useCallback((noscroll = false) => {
        if (music.paused) return;
        // use getBoundingClientRect so that the dimensions do not rely on scale
        const height = innerEl.getBoundingClientRect().height;
        const progress = music.currentTime / music.duration;
        const progressPosition = (1 - progress) * height;
    
        if (follow && !noscroll) keepInView(progressPosition + progressOffset);
        // percentage keeps the progress position unchanged upon scaling
        const progressRatio = progressPosition / height;
        if (progressEl) progressEl.style.top = `${progressRatio * 100}%`;
    }, [progressEl, innerEl, music, follow, keepInView, progressOffset]);
    useFrame(updateProgress);
    
    const seekProgress = useCallback((e) => {
        if (code !== 'player') return;
        const { time } = inflate(e);
        music.currentTime = time;
        if (music.paused) music.play();
        updateProgress(true);
    }, [code, inflate, music, updateProgress]);
    useEvent(innerEl, 'click', seekProgress);
    
    useEffect(updateProgress, [updateProgress, code]);
    return code === 'player' && (
        <div ref={setProgressEl} className={classes.root}/>
    );
}

export default Progress;
