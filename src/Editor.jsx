import React, { useEffect, useMemo, useState } from 'react';
import Chart from './chart/Chart';

function Editor({ score, musicURL }) {
    const music = useMemo(() => new Audio(musicURL), [musicURL]);
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        const onDurationChange = () => setInitialized(music.duration > 0);
        music.addEventListener('durationchange', onDurationChange);
        return () => music.removeEventListener('durationchange', onDurationChange);
    }, [music, initialized]);

    return initialized && <Chart music={music} score={score}/>;
};

export default Editor;
