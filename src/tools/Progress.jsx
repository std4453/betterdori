import { useCallback } from 'react';
import useEvent from './useEvent';
import useFrame from './useFrame';

function Progress({
    music, music: { duration }, containerEl, code, inflate, follow, scale, progressOffset, keepInView,
}) {
    const seekProgress = useCallback((e) => {
        if (code !== 'player') return;
        const { time } = inflate(e);
        music.currentTime = time;
        if (music.paused) music.play();
    }, [code, inflate, music]);
    useEvent(containerEl, 'click', seekProgress);
    const updateView = useCallback(() => {
        const progress = (duration - music.currentTime) * scale;
        if (follow && !music.paused) keepInView(progress + progressOffset);
    }, [duration, follow, keepInView, music, progressOffset, scale]);
    useFrame(updateView);
    return null;
}

export default Progress;
