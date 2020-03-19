import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useEvent from './useEvent';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
        height: 0,
        borderBottom: '3px solid #5996FF',
        marginTop: -1.5,
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

function PlayerCaret({ inflate, innerEl, countNotes, code }) {
    const classes = useStyles();

    const [caretEl, setCaretEl] = useState(null);
    const [notesCounterEl, setNotesCounterEl] = useState(null);
    const updateCaret = useCallback((e) => {
        const { ratioTop, time } = inflate(e);
        if (caretEl) caretEl.style.top = `${ratioTop * 100}%`;
        if (notesCounterEl) notesCounterEl.innerHTML = `${countNotes(time)}`;
    }, [caretEl, notesCounterEl, inflate, countNotes]);
    useEvent(innerEl, 'mousemove', updateCaret);

    return code === 'player' && (
        <div ref={setCaretEl} className={classes.root}>
            <div ref={setNotesCounterEl} className={classes.notesCounter}/>
        </div>
    );
}

export default PlayerCaret;
