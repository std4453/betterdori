import { makeStyles } from '@material-ui/styles';
import React, { useCallback, useEffect, useState } from 'react';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: `${2 / 11 * 100}%`,
        right: `${2 / 11 * 100}%`,
        height: 0,
        borderBottom: '3px solid #5996FF',
        marginTop: -1.5,
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

function Caret({ compiled: { music, notesIndex }, innerEl }) {
    const classes = useStyles();

    const [caretEl, setCaretEl] = useState(null);
    const [notesCounterEl, setNotesCounterEl] = useState(null);
    const updateProgress = useCallback((e) => {
        if (!caretEl || !innerEl || !notesCounterEl) return;
        const { y, height } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        caretEl.style.top = `${top}px`;
        const time = (1 - top / height) * music.duration;
        const notesCount = notesIndex.le(time).value;
        notesCounterEl.innerHTML = `${notesCount}`;
    }, [caretEl, innerEl, notesCounterEl, music.duration, notesIndex]);
    useEffect(() => {
        if (!innerEl) return;
        innerEl.addEventListener('mousemove', updateProgress);
        return () => innerEl.removeEventListener('mousemove', updateProgress);
    }, [innerEl, updateProgress]);

    return (
        <div ref={setCaretEl} className={classes.root}>
            <div ref={setNotesCounterEl} className={classes.notesCounter}/>
        </div>
    );
}

export default Caret;
