/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { normalizeWheel } from '../utils';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: '11em',
        fontSize: `${470 / 11}px`,
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
        willChange: 'scroll-position',
    },
    inner: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 5000,
    },
});

function Score({
    music, scale, setScale, scaleSpeed, minScale, maxScale, scrollSpeed,
    setContainerEl, setInnerEl, children, scrollRef,
}) {
    const classes = useStyles();

    // scale = pixels per second
    const onWheel = useCallback((e) => {
        const { pixelY } = normalizeWheel(e.nativeEvent);
        if (e.ctrlKey) { // scaling
            const height = scale * music.duration;
            // scaling keeps the cursor unmoved, that is, 
            const ratio = (e.clientY + scrollRef.current) / height;
            // scale changes on a proportional basis, a same scroll distance
            // results in a same proportion of scale change.
            let newScale = scale * (1 - pixelY * scaleSpeed);
            if (newScale < minScale) newScale = minScale;
            if (newScale > maxScale) newScale = maxScale;
            const newHeight = newScale * music.duration;
            let newScroll = ratio * newHeight - e.clientY;
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > newHeight) newScroll = newHeight - window.innerHeight;
            scrollRef.current = newScroll;
            setScale(newScale);
        } else {
            const height = scale * music.duration;
            // scroll changes proportional to scale, a same scroll distance
            // results in a same scroll change measured in *beats*. 
            let newScroll = scrollRef.current + pixelY * scrollSpeed * Math.sqrt(scale);
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > height) newScroll = height - window.innerHeight;
            scrollRef.current = newScroll;
        }
    }, [scale, music.duration, scrollRef, scaleSpeed, minScale, maxScale, setScale, scrollSpeed]);
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
        const height = music.duration * scale;
        // const { height } = innerEl.getBoundingClientRect();
        scrollRef.current = height - window.innerHeight;
        // containerEl.scrollTop = height - window.innerHeight;
    }, [scrollRef]);

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return (
        <div
            ref={setContainerEl}
            className={classes.root}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            <div
                ref={setInnerEl}
                style={{ height: music.duration * scale }}
                className={classes.inner}>
                {children}
            </div>
        </div>
    );
};

export default Score;
