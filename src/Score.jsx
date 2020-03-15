import React, { useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';

import Bars from './Bars';
import Notes from './Notes';
import { compileSong } from './Song';
import SoundFX from './SoundFX';
import Progress from './Progress';
import Caret from './Caret';
import Player from './Player';
import { Tools } from './Tool';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: 470,
        fontSize: `${470 / 11}px`,
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'auto',
    },
    inner: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 5000,
    },
});

const settings = {
    scale: 600,
    follow: true,
    progressOffset: 180,
    division: 2,
};

function Score({ song, setSong }) {
    const classes = useStyles();
    const compiled = useMemo(() => compileSong(song), [song]);
    
    const [root, setRoot] = useState(null);
    const [inner, setInner] = useState(null);

    return (
        <div ref={setRoot} className={classes.root}>
            <div
                ref={setInner}
                style={{ height: compiled.music.duration * settings.scale }}
                className={classes.inner}
            >
                <Tools>
                    <Player compiled={compiled}/>
                </Tools>

                <Bars compiled={compiled} settings={settings}/>
                <Notes compiled={compiled}/>
                <SoundFX compiled={compiled}/>
                <Progress compiled={compiled} containerEl={root} settings={settings}/>
                <Caret compiled={compiled} innerEl={inner}/>
            </div>
        </div>
    );
};

export default Score;
