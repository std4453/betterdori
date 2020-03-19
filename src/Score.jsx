import React, { useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import tools from './tools/config';
import useScore from './useScore';
import { normalizeWheel } from './tools/utils';
import Controls from './ui/Controls';
import useChart from './useChart';

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

function Score({ music }) {
    const classes = useStyles();

    const chartParams = useChart(music);
    const {
        scale, setScale, scaleSpeed, minScale, maxScale, scrollSpeed,
    } = chartParams;
    const scoreParams = useScore(chartParams);
    const {
        containerEl, setContainerEl, innerEl, setInnerEl,
    } = scoreParams;

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

    return <>
        <div
            ref={setContainerEl}
            className={classes.root}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            <div
                ref={setInnerEl}
                style={{ height: music.duration * scale }}
                className={classes.inner}>
                {tools.map((Component, i) => (
                    <Component key={i} {...chartParams} {...scoreParams}/>
                ))}
            </div>
        </div>
        <Controls {...chartParams} {...scoreParams}/>
    </>;
};

export default Score;
