import { useState, useCallback } from 'react';

const useScore = ({ music: { duration }, time2Timers }) => {
    const [containerEl, setContainerEl] = useState(null);
    const [innerEl, setInnerEl] = useState(null);

    const inflate = useCallback((e) => {
        const { x, y, height, width } = innerEl.getBoundingClientRect();
        const top = e.clientY - y;
        const left = e.clientX - x;
        const time = (1 - top / height) * duration;
        const { key: startTime, value: { beat: startBeat, bpm } } = time2Timers.le(time);
        const beat = startBeat + (time - startTime) / 60 * bpm;
        const lane = left / width * 11 - 2.5;
        const ratioTop = top / height;
        return { top, left, time, beat, lane, ratioTop };
    }, [duration, innerEl, time2Timers]);

    const keepInView = useCallback((position) => {
        const height = innerEl.getBoundingClientRect().height;
        let viewTop = position - window.innerHeight;
        if (viewTop < 0) viewTop = 0;
        else if (position > height) viewTop = height - window.innerHeight;
        if (containerEl) containerEl.scrollTop = viewTop;
    }, [containerEl, innerEl]);
    
    const params = {
        containerEl, setContainerEl, innerEl, setInnerEl,
        inflate, keepInView,
    };

    return params;
};

export default useScore;
