import React, { useCallback, useEffect, useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ToolContext } from './Tool';
import focus from '../assets/focus.svg';
import { quantize } from './utils';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
        height: '100%',
    },
    focus: {
        position: 'absolute',
        width: '1.4em',
        height: '1.4em',
        marginLeft: '-0.2em',
        marginBottom: '-0.7em',
        pointerEvents: 'none',
    },
});

const calcPlacement = (e, innerEl, duration, time2Timers, division) => {
    const { x, y, height, width } = innerEl.getBoundingClientRect();
    const top = e.clientY - y;
    const time = (1 - top / height) * duration;
    const { beat, time: quantizedTime } = quantize(time, time2Timers, division);
    const left = e.clientX - x;
    // round to center of each lane
    const lane = Math.round(left / width * 11 - 2.5);
    return { lane, time: quantizedTime, beat };
};

function Placement({
    time2Timers, notes, setNotes, music: { duration }, innerEl, settings: { division },
}) {
    const classes = useStyles();

    const [focusEl, setFocusEl] = useState(null);
    const updateFocus = useCallback((e) => {
        if (!focusEl || !innerEl) return;
        const { lane, time } = calcPlacement(e, innerEl, duration, time2Timers, division);
        if (lane < 0 || lane >= 7) {
            focusEl.style.visibility = 'hidden';
        } else {
            focusEl.style.visibility = '';
            focusEl.style.left = `${100 / 7 * lane}%`;
            focusEl.style.bottom = `${time / duration * 100}%`;
        }
    }, [focusEl, innerEl, duration, time2Timers, division]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('mousemove', updateFocus);
        return () => innerEl.removeEventListener('mousemove', updateFocus);
    }, [innerEl, updateFocus]);

    const { code, setCode } = useContext(ToolContext);
    const setMyCode = useCallback(() => setCode('single'), [setCode]);
    
    const addNote = useCallback((e) => {
        if (code !== 'single') return;
        if (!focusEl || !innerEl) return;
        const { beat, lane } = calcPlacement(e, innerEl, duration, time2Timers, division);
        if (lane < 0 || lane >= 7) return;
        setNotes(notes.insert(beat, { note: 'Single', lane }));
    }, [code, division, duration, focusEl, innerEl, notes, setNotes, time2Timers]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('click', addNote);
        return () => innerEl.removeEventListener('click', addNote);
    }, [innerEl, addNote]);

    return (
        <div className={classes.root}>
            <KeyboardEventHandler handleKeys={['f']} onKeyEvent={setMyCode}/>
            {code === 'single' && <img
                ref={setFocusEl}
                className={classes.focus}
                alt="focus"
                src={focus}/>}
        </div>
    );
}

export default Placement;
