import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Score from './Score';
import test_score from './test_score.json';
import test_music from './test_music.mp3';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'stretch',
        height: '100%',
    },
});

const preprocessScore = (notes, duration) => {
    const ranges = [];
    for (const { type, cmd, beat, bpm } of notes) {
        if (type !== 'System' || cmd !== 'BPM') continue;
        ranges.push({ beat, bpm });
    }
    return {
        duration,
        ranges,
    }
}

function Editor() {
    const classes = useStyles();
    const music = useMemo(() => new Audio(test_music), []);
    const [data, setData] = useState({
        music, notes: test_score,
    });
    const onKeyPress = useCallback((event) => {
        const { code } = event;
        switch (code) {
            case 'Space': {
                if (music.paused) music.play();
                else music.pause();
                event.stopPropagation();
                event.preventDefault();
                break;
            }
            default:
        }
    }, [music]);
    useEffect(() => {
        window.addEventListener('keypress', onKeyPress);
        return () => window.removeEventListener('keypress', onKeyPress);
    }, [onKeyPress]);
    return (
        <div className={classes.root}>
            <Score data={data} setData={setData}/>
        </div>
    );
};

export default Editor;
