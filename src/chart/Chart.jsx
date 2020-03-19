import React from 'react';

import Controls from '../ui/Controls';

import useTool from './useTool';
import useScore from './useScore';
import useChart from './useChart';

import Score from './Score';
import Bars from './Bars';
import Notes from './Notes';

import Player from '../tools/Player';
import SoundFX from '../tools/SoundFX';
import Progress from '../tools/Progress';
import PlayerCaret from '../tools/PlayerCaret';
import Markers from '../tools/Markers';
import Placement from '../tools/Placement';
import Divisions from '../tools/Divisions';
import PlacementCaret from '../tools/PlacementCaret';
import Modification from '../tools/Modification';

function Chart({ music }) {
    const chartParams = useChart(music);
    const scoreParams = useScore(chartParams);
    const toolParams = useTool();
    const params = { music, ...chartParams, ...scoreParams, ...toolParams };

    return <>
        <Score {...params}>
            <Bars {...params}/>

            <PlacementCaret {...params}/>
            <Placement {...params}/>

            <Notes  {...params}/>

            <PlayerCaret {...params}/>
            <Progress {...params}/>
            <Player {...params}/>
            <SoundFX {...params}/>
            <Markers {...params}/>

            <Divisions {...params}/>
            <Modification  {...params}/>
        </Score>
        <Controls music={music} {...params}/>
    </>;
};

export default Chart;
