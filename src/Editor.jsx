import React, { useEffect, useMemo, useState } from 'react';
import test_music from './assets/test_music.mp3';
import Chart from './chart/Chart';

function Editor() {
    const music = useMemo(() => new Audio(test_music), []);
    const [initialized, setInitialized] = useState(false);
    useEffect(() => {
        const onDurationChange = () => setInitialized(music.duration > 0);
        music.addEventListener('durationchange', onDurationChange);
        return () => music.removeEventListener('durationchange', onDurationChange);
    }, [music, initialized]);

    return initialized && <Chart music={music}/>;
};

export default Editor;
