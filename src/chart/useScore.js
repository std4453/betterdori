import { useState, useCallback, useRef, useEffect } from 'react';

const useScore = ({ music: { duration }, time2Timers, scale }) => {
    const [containerEl, setContainerEl] = useState(null);
    const scrollRef = useRef(0);
    const [rect, setRect] = useState({ x: 0, width: 100 });
    useEffect(() => {
        if (!containerEl) return;
        setRect(containerEl.getBoundingClientRect());
    }, [containerEl]);

    const inflate = useCallback((e) => {
        const { x, width } = rect;
        const y = -scrollRef.current;
        const height = scale * duration;
        const top = e.clientY - y;
        const left = e.clientX - x;
        const time = (1 - top / height) * duration;
        const { key: startTime, value: { beat: startBeat, bpm } } = time2Timers.le(time);
        const beat = startBeat + (time - startTime) / 60 * bpm;
        const lane = left / width * 11 - 2.5;
        const ratioTop = top / height;
        return { top, left, time, beat, lane, ratioTop };
    }, [duration, rect, scale, time2Timers]);

    const keepInView = useCallback((position) => {
        const height = scale * duration;
        let viewTop = position - window.innerHeight;
        if (viewTop < 0) viewTop = 0;
        else if (position > height) viewTop = height - window.innerHeight;
        scrollRef.current = viewTop;
    }, [duration, scale]);

    const deflate = useCallback(({ time, lane }) => {
        const { x, width } = rect;
        const y = -scrollRef.current;
        const height = scale * duration;
        return {
            x: x + (lane + 2.5) / 11 * width,
            y: y + height * (1 - time / duration),
        };
    }, [duration, rect, scale]);
    
    const params = {
        containerEl, setContainerEl,
        inflate, keepInView, deflate, scrollRef, rect,
    };

    return params;
};

export default useScore;
