import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 0,
        borderBottom: '3px solid #FFF',
        marginTop: -1.5,
    },
    notesCounter: {
        position: 'absolute',
        left: 0,
        top: 0,
        margin: 10,
        fontSize: 18,
        color: '#FFF',
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
