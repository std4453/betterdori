import React, { useEffect, useMemo, useState } from 'react';
import test_music from './assets/test_music.mp3';
import Chart from './chart/Chart';
import { load } from './chart/storage';

function Editor() {
    const score = useMemo(() => load(), []);
    const music = useMemo(() => new Audio(test_music), []);
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        const onDurationChange = () => setInitialized(music.duration > 0);
        music.addEventListener('durationchange', onDurationChange);
        return () => music.removeEventListener('durationchange', onDurationChange);
    }, [music, initialized]);

    return initialized && <Chart music={music} score={score}/>;
};

export default Editor;
