import { makeStyles } from '@material-ui/styles';
import React, { useCallback, useEffect, useState } from 'react';

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

function Progress({ music, containerEl, settings: { follow, scale, progressOffset } }) {
    const classes = useStyles();

    const [progressEl, setProgressEl] = useState(null);
    const updateProgress = useCallback(() => {
        if (!progressEl) return;

        const height = music.duration * scale;
        const progress = music.currentTime / music.duration;
        const caretPosition = (1 - progress) * height;
    
        let viewTop = caretPosition + progressOffset - window.innerHeight;
        // keep caret in view, but not exceeding score boundaries
        if (viewTop < 0) viewTop = 0;
        else if (caretPosition + progressOffset > height) viewTop = height - window.innerHeight;
        if (follow && containerEl) containerEl.scrollTop = viewTop;

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
    useEffect(updateProgress, [updateProgress]);

    return (
        <div ref={setProgressEl} className={classes.root}/>
    );
}

export default Progress;
