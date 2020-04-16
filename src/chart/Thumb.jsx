import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useDrag from '../tools/useDrag';
import { normalizeWheel } from '../utils';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        backgroundColor: '#000000',
        width: '11em',
        fontSize: `${78 / 11}px`,
        right: 0,
        top: 0,
        height: '100%',
        overflow: 'hidden',
    },
});

function Thumb({
    children, scaleRef, music: { duration }, containerEl, thumbScrollSpeed, scrollRef,
}) {
    const classes = useStyles();

    const [thumbEl, setThumbEl] = useState(null);
    const updateScroll = useCallback((e, { left }) => {
        if (!containerEl) return;
        if (!left) return;
        const scale = scaleRef.current;
        const position = e.clientY / window.innerHeight * duration;
        const viewSize = window.innerHeight / scale; // in seconds
        const height = duration * scale;
        // const { height } = innerEl.getBoundingClientRect();
        let top = (position - viewSize / 2) / duration * height; // in px
        if (top < 0) top = 0;
        if (top + window.innerHeight > height) top = height - window.innerHeight;
        scrollRef.current = top;
        // containerEl.scrollTop = top;
    }, [containerEl, duration, scaleRef, scrollRef]);
    useDrag({ onDrag: updateScroll, onDragEnd: updateScroll, el: thumbEl });

    // scale = pixels per second
    const onWheel = useCallback((e) => {
        if (!containerEl) return;
        const { pixelY } = normalizeWheel(e.nativeEvent);
        const scale = scaleRef.current;
        const height = duration * scale;
        const viewTop = scrollRef.current / height * window.innerHeight;
        const viewHeight = window.innerHeight / scale;
        let newTop = viewTop + pixelY * thumbScrollSpeed;
        if (newTop < 0) newTop = 0;
        if (newTop + viewHeight > window.innerHeight) newTop = window.innerHeight - viewHeight;
        const newScroll = newTop / window.innerHeight * height;
        scrollRef.current = newScroll;
    }, [containerEl, duration, scaleRef, scrollRef, thumbScrollSpeed]);

    return (
        <div className={classes.root} ref={setThumbEl} onWheel={onWheel}>
            {children}
        </div>
    );
};

export default Thumb;
