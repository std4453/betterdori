import React from 'react';
import { makeStyles } from '@material-ui/styles';

import Controls from '../ui/Controls';

import useTool from './useTool';
import useScore from './useScore';
import useChart from './useChart';

import Score from './Score';
import Bars from './Bars';
import Notes from './Notes';
import Thumb from './Thumb';
import Stencil from './Stencil';
import Timers from './Timers';
import ThumbTimers from './ThumbTimers';

import Player from '../tools/Player';
import SoundFX from '../tools/SoundFX';
import Progress from '../tools/Progress';
import PlayerCaret from '../tools/PlayerCaret';
import Markers from '../tools/Markers';
import Placement from '../tools/Placement';
import Divisions from '../tools/Divisions';
import PlacementCaret from '../tools/PlacementCaret';
import Modification from '../tools/Modification';
import PlaceTimer from '../tools/PlaceTimer';

const useStyles = makeStyles({
    middle: {
        position: 'absolute',
        left: '25%',
        top: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'stretch',
    },
    right: {
        position: 'absolute',
        right: 0,
        height: '100%',
        top: 0,
    },
});

function Chart({ music }) {
    const classes = useStyles();

    const chartParams = useChart(music);
    const scoreParams = useScore(chartParams);
    const toolParams = useTool();
    const params = { music, ...chartParams, ...scoreParams, ...toolParams };

    return <>
        <div className={classes.middle}>
            <Score {...params}>
                <Bars {...params}/>
                <Timers {...params}/>

                <PlacementCaret {...params}/>
                <Placement {...params}/>

                <Notes {...params}/>

                <PlayerCaret {...params}/>
                <Progress {...params}/>
                <Player {...params}/>
                <SoundFX {...params}/>
                <Markers {...params}/>

                <Divisions {...params}/>
                <Modification  {...params}/>
                <PlaceTimer {...params}/>
            </Score>
            <Controls music={music} {...params}/>
        </div>
        <div className={classes.right}>
            <Thumb {...params}>
                <Bars {...params} division={1 / 4} thumb={true}/>
                <ThumbTimers {...params}/>
                <Notes {...params} thumb={true}/>
                <Stencil {...params}/>
            </Thumb>
        </div>
    </>;
};

export default Chart;
