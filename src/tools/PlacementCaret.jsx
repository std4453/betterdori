import { makeStyles } from '@material-ui/styles';
import React, { useCallback, useState } from 'react';
import useEvent from './useEvent';

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
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
    },
});

function PlacementCaret({ music: { duration }, containerEl, quantize, inflate, code }) {
    const classes = useStyles();

    const [caretEl, setCaretEl] = useState(null);
    const [notesCounterEl, setNotesCounterEl] = useState(null);
    const updateCaret = useCallback((e) => {
        const { time } = inflate(e);
        const { time: quantizedTime, beat } = quantize(time);
        if (caretEl) caretEl.style.bottom = `${quantizedTime / duration * 100}%`;
        if (notesCounterEl) notesCounterEl.innerHTML = `${beat.toFixed(2)}'`;
    }, [inflate, quantize, caretEl, duration, notesCounterEl]);
    useEvent(containerEl, 'mousemove', updateCaret);

    return (code.startsWith('placement/') || code.startsWith('modification/') || code === 'timer') && (
        <div ref={setCaretEl} className={classes.root}>
            <div ref={setNotesCounterEl} className={classes.notesCounter}/>
        </div>
    );
}

export default PlacementCaret;
