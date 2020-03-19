import React, { useCallback, useEffect, useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { ToolContext } from './Tool';

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

function Progress({ music, containerEl, innerEl, follow, progressOffset }) {
    const classes = useStyles();

    const [progressEl, setProgressEl] = useState(null);
    const updateProgress = useCallback((noscroll = false) => {
        if (!progressEl || !innerEl) return;

        // use getBoundingClientRect so that the dimensions do not rely on scale
        const height = innerEl.getBoundingClientRect().height;
        const progress = music.currentTime / music.duration;
        const progressPosition = (1 - progress) * height;
    
        let viewTop = progressPosition + progressOffset - window.innerHeight;
        // keep progress in view, but not exceeding score boundaries
        if (viewTop < 0) viewTop = 0;
        else if (progressPosition + progressOffset > height) viewTop = height - window.innerHeight;
        if (follow && !noscroll && containerEl) containerEl.scrollTop = viewTop;

        // percentage keeps the progress position unchanged upon scaling
        const progressRatio = progressPosition / height;
        progressEl.style.top = `${progressRatio * 100}%`;
    }, [progressEl, innerEl, music, progressOffset, follow, containerEl]);
    useEffect(() => {
        let valid = true;
        const onFrameWrapped = () => {
            if (!music.paused) updateProgress();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [music, updateProgress]);
    
    const { code } = useContext(ToolContext);
    const seekProgress = useCallback((e) => {
        if (!innerEl || code !== 'player') return;
        const { y, height } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        music.currentTime = (1 - top / height) * music.duration;
        updateProgress(true);
        if (music.paused) music.play();
    }, [innerEl, music, updateProgress, code]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('click', seekProgress);
        return () => innerEl.removeEventListener('click', seekProgress);
    }, [innerEl, seekProgress]);
    
    useEffect(updateProgress, [updateProgress, code]);
    return code === 'player' && (
        <div ref={setProgressEl} className={classes.root}/>
    );
}

export default Progress;
