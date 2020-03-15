import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Score from './Score';
import test_score from './test_score.json';
import test_music from './test_music.mp3';
import { createSong } from './Song';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'stretch',
        height: '100%',
    },
});

function Editor() {
    const classes = useStyles();
    const [song, setSong] = useState(createSong(new Audio(test_music), test_score));
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        const onDurationChange = () => setInitialized(song.music.duration > 0);
        song.music.addEventListener('durationchange', onDurationChange);
        return () => song.music.removeEventListener('durationchange', onDurationChange);
    }, [song, initialized]);

    return (
        <div className={classes.root}>
            {initialized && <>
                <Score song={song} setSong={setSong}/>
            </>}
        </div>
    );
};

export default Editor;
