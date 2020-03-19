import React from 'react';
import tools from './tools/config';
import useScore from './useScore';
import Controls from './ui/Controls';
import useChart from './useChart';
import Score from './Score';
import useTool from './useTool';

function Chart({ music }) {
    const chartParams = useChart(music);
    const scoreParams = useScore(chartParams);
    const toolParams = useTool();
    const params = { music, ...chartParams, ...scoreParams, ...toolParams };

    return <>
        <Score {...params}>
            {tools.map((Component, i) => <Component key={i} {...params}/>)}
        </Score>
        <Controls music={music} {...params}/>
    </>;
};

export default Chart;
