import React, { useCallback, useEffect, useState, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { ToolContext } from './Tool';

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

function Caret({ time2Notes, music: { duration }, innerEl }) {
    const classes = useStyles();

    const { code } = useContext(ToolContext);
    const [caretEl, setCaretEl] = useState(null);
    const [notesCounterEl, setNotesCounterEl] = useState(null);
    const updateCaret = useCallback((e) => {
        if (!caretEl || !innerEl || !notesCounterEl) return;
        const { y, height } = innerEl.getBoundingClientRect();
        // percentage keeps the progress position unchanged upon scaling
        const top = (e.clientY - y) / height;
        caretEl.style.top = `${top * 100}%`;
        const time = (1 - top) * duration;
        const { valid, index } = time2Notes.le(time);
        // an invalid iterator with index = size - 1 is returned if the
        // key is smaller than the smallest key. index + 1 since we want to
        // disolay the number of notes *including* this one.
        const notesCount = valid ? index + 1 : 0;
        notesCounterEl.innerHTML = `${notesCount}`;
    }, [caretEl, innerEl, notesCounterEl, duration, time2Notes]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('mousemove', updateCaret);
        return () => innerEl.removeEventListener('mousemove', updateCaret);
    }, [innerEl, updateCaret]);

    return code === 'player' && (
        <div ref={setCaretEl} className={classes.root}>
            <div ref={setNotesCounterEl} className={classes.notesCounter}/>
        </div>
    );
}

export default Caret;
