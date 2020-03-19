import React, { useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';

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

// scroll speed normalizer from https://stackoverflow.com/a/30134826/3871776

// Reasonable defaults
var PIXEL_STEP = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;

function normalizeWheel(/*object*/ event) /*object*/ {
    var sX = 0, sY = 0,       // spinX, spinY
        pX = 0, pY = 0;       // pixelX, pixelY

    // Legacy
    if ('detail' in event) { sY = event.detail; }
    if ('wheelDelta' in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

    // side scrolling on FF with DOMMouseScroll
    if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
        sX = sY;
        sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }

    if ((pX || pY) && event.deltaMode) {
        if (event.deltaMode === 1) {          // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
        } else {                             // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
        }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    return {
        spinX: sX,
        spinY: sY,
        pixelX: pX,
        pixelY: pY
    };
}

function Score({
    music, scale, setScale, scaleSpeed, minScale, maxScale, scrollSpeed,
    containerEl, setContainerEl, innerEl, setInnerEl, children
}) {
    const classes = useStyles();

    // scale = pixels per second
    const onWheel = useCallback((e) => {
        if (!containerEl) return;
        const { pixelY } = normalizeWheel(e.nativeEvent);
        if (e.ctrlKey) { // scaling
            const height = scale * music.duration;
            // scaling keeps the cursor unmoved, that is, 
            const ratio = (e.clientY + containerEl.scrollTop) / height;
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
            containerEl.scrollTop = newScroll;
            setScale(newScale);
        } else {
            const height = scale * music.duration;
            // scroll changes proportional to scale, a same scroll distance
            // results in a same scroll change measured in *beats*. 
            let newScroll = containerEl.scrollTop + pixelY * scrollSpeed * Math.sqrt(scale);
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > height) newScroll = height - window.innerHeight;
            containerEl.scrollTop = newScroll;
        }
    }, [containerEl, scale, music.duration, scaleSpeed, minScale, maxScale, setScale, scrollSpeed]);
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
        if (!innerEl || !containerEl) return;
        const { height } = innerEl.getBoundingClientRect();
        containerEl.scrollTop = height - window.innerHeight;
    }, [containerEl, innerEl]);

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
