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

function Progress({ music, containerEl, innerEl, settings: { follow, scale, progressOffset } }) {
    const classes = useStyles();

    const [progressEl, setProgressEl] = useState(null);
    const updateProgress = useCallback((noscroll = false) => {
        if (!progressEl) return;

        const height = music.duration * scale;
        const progress = music.currentTime / music.duration;
        const caretPosition = (1 - progress) * height;
    
        let viewTop = caretPosition + progressOffset - window.innerHeight;
        // keep caret in view, but not exceeding score boundaries
        if (viewTop < 0) viewTop = 0;
        else if (caretPosition + progressOffset > height) viewTop = height - window.innerHeight;
        if (follow && !noscroll && containerEl) containerEl.scrollTop = viewTop;

        progressEl.style.top = `${caretPosition}px`;
    }, [containerEl, progressEl, music, follow, scale, progressOffset]);
    useEffect(() => {
        let valid = true;
        const onFrameWrapped = () => {
            if (!music.paused) updateProgress();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [music, updateProgress]);

    const seekProgress = useCallback((e) => {
        if (!innerEl) return;
        const { y, height } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        music.currentTime = (1 - top / height) * music.duration;
        updateProgress(true);
    }, [innerEl, music, updateProgress]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('click', seekProgress);
        return () => innerEl.removeEventListener('click', seekProgress);
    }, [innerEl, seekProgress]);

    const { code } = useContext(ToolContext);
    useEffect(updateProgress, [updateProgress, code]);
    return code === 'player' && (
        <div ref={setProgressEl} className={classes.root}/>
    );
}

export default Progress;