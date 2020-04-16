import { useCallback } from 'react';
import useEvent from './useEvent';

function Progress({
    music, containerEl, code, inflate,
}) {
    const seekProgress = useCallback((e) => {
        if (code !== 'player') return;
        const { time } = inflate(e);
        music.currentTime = time;
        if (music.paused) music.play();
    }, [code, inflate, music]);
    useEvent(containerEl, 'click', seekProgress);
    return null;
}

export default Progress;
