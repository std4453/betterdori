import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import useFrame from '../tools/useFrame';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        height: '100%',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
    },
    timer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '0.6em',
        marginBottom: '-0.3em',
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '50%',
            borderBottom: '3px solid #FFCD18',
            marginBottom: -1.5,
            pointerEvents: 'none',
        },
    },
    bpm: {
        position: 'absolute',
        left: '100%',
        top: '50%',
        marginTop: '-0.5em',
        paddingLeft: '0.25em',
        fontSize: '0.6em',
        lineHeight: 1,
        color: '#FFCD18',
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
        willChange: 'opacity',
    },
    lastBPM: {
        willChange: 'opacity',
        position: 'fixed',
        left: `calc(25vw + ${9 / 0.6}em)`,
        bottom: 0,
        marginLeft: '0.25em',
        paddingBottom: '0.6em',
        fontSize: '0.6em',
        lineHeight: 1,
        color: '#FFCD18',
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            left: '50%',
            bottom: '0.25em',
            width: 0,
            height: 0,
            marginLeft: '-0.2em',
            borderTop: '0.2em solid #FFCD18',
            borderLeft: '0.2em solid transparent',
            borderRight: '0.2em solid transparent',
        },
    },
});

function Timer({ time, bpm, duration, observer }) {
    const classes = useStyles();
    const [el, setEl] = useState(null);
    useEffect(() => {
        if (!el) return;
        observer.observe(el);
        return () => observer.unobserve(el);
    }, [el, observer]);
    return (
        <div
            ref={setEl}
            className={classes.timer}
            style={{ bottom: `${time / duration * 100}%` }}>
            <div className={classes.bpm}>{bpm}</div>
        </div>
    );
}

function Timers({ time2Timers, music: { duration }, containerEl, innerEl }) {
    const classes = useStyles();

    const onIntersect = useCallback((entries) => {
        for (const { boundingClientRect: { top, bottom }, target } of entries) {
            target.style.opacity = (top + bottom) / 2 < window.innerHeight ? 1 : 0;
        }
    }, []);
    const observer = useMemo(
        () => new IntersectionObserver(onIntersect, { threshold: 0.5 }),
        [onIntersect]);
    useEffect(() => {
        if (!observer) return;
        return () => observer.disconnect();
    }, [observer]);
    const timerEls = useMemo(() => {
        const res = [];
        time2Timers.forEach((time, { beat, bpm }) => {
            res.push((
                <Timer key={beat} time={time} bpm={bpm} duration={duration} observer={observer}/>
            ));
        });
        return res;
    }, [time2Timers, duration, observer]);

    const [lastBPMEl, setLastBPMEl] = useState(null);
    const updateTimerEls = useCallback(() => {
        if (!containerEl || !innerEl || !lastBPMEl) return;
        const { height, width } = innerEl.getBoundingClientRect();
        // on music change, duration will become 0 suddenly, before React could even
        // 'react' on the change, whicl will make bottomTime -Infinity, crashing the
        // application bu timer2Timers.le(bottomTime) returning nothing.
        const bottomTime = Math.max((1 - (containerEl.scrollTop + window.innerHeight) / height) * duration, 0);
        const em = width / 11;
        const threshold = 1.25;
        const { key: nextTime, valid } = time2Timers.gt(bottomTime);
        if (valid && (nextTime - bottomTime) < em * threshold / height * duration) {
            lastBPMEl.style.opacity = 0;
        } else {
            lastBPMEl.style.opacity = 1;
            const { value: { bpm } } = time2Timers.le(bottomTime);
            if (lastBPMEl.innerHTML !== `${bpm}`) {
                lastBPMEl.innerHTML = `${bpm}`;
            }
        }
    }, [containerEl, duration, innerEl, lastBPMEl, time2Timers]);
    useFrame(updateTimerEls);

    return (
        <div className={classes.root}>
            {timerEls}
            <div className={classes.lastBPM} ref={setLastBPMEl}/>
        </div>
    );
}

export default Timers;
