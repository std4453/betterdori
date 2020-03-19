import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import test_music from './assets/test_music.mp3';
import Chart from './chart/Chart';

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
            {initialized && <Chart music={music}/>}
        </div>
    );
};

export default Editor;
