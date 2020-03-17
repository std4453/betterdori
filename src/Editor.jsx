import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import Score from './Score';
import test_music from './assets/test_music.mp3';
import { Tools } from './tools/Tool';

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
    const music = useMemo(() => new Audio(test_music), []);
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        const onDurationChange = () => setInitialized(music.duration > 0);
        music.addEventListener('durationchange', onDurationChange);
        return () => music.removeEventListener('durationchange', onDurationChange);
    }, [music, initialized]);

    return (
        <div className={classes.root}>
            <Tools>
                {initialized && <Score music={music}/>}
            </Tools>
        </div>
    );
};

export default Editor;
