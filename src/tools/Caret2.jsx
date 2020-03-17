import React, { useCallback, useEffect, useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { ToolContext } from './Tool';
import { quantize } from './utils';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
        height: 0,
        borderBottom: '3px solid #5996FF',
        marginBottom: -1.5,
        pointerEvents: 'none',
    },
    notesCounter: {
        position: 'absolute',
        right: '100%',
        top: 0,
        marginTop: '-0.5em',
        paddingRight: '0.25em',
        fontSize: '0.6em',
        lineHeight: 1,
        color: '#5996FF',
        fontFamily: 'DIN',
        fontWeight: 'normal',
    },
});

function Caret2({ time2Timers, music: { duration }, innerEl, settings: { division } }) {
    const classes = useStyles();

    const { code } = useContext(ToolContext);
    const [caretEl, setCaretEl] = useState(null);
    const [notesCounterEl, setNotesCounterEl] = useState(null);
    const updateCaret = useCallback((e) => {
        if (!caretEl || !notesCounterEl || !innerEl) return;
        const { y, height } = innerEl.getBoundingClientRect();
        const time = (1 - (e.clientY - y) / height) * duration;
        const { time: quantizedTime, beat } = quantize(time, time2Timers, division);
        caretEl.style.bottom = `${quantizedTime / duration * 100}%`;
        notesCounterEl.innerHTML = `${beat.toFixed(2)}'`;
    }, [caretEl, notesCounterEl, innerEl, duration, time2Timers, division]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('mousemove', updateCaret);
        return () => innerEl.removeEventListener('mousemove', updateCaret);
    }, [innerEl, updateCaret]);

    return (code.startsWith('placement/') || code.startsWith('modification/')) && (
        <div ref={setCaretEl} className={classes.root}>
            <div ref={setNotesCounterEl} className={classes.notesCounter}/>
        </div>
    );
}

export default Caret2;
