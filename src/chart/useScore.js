import { useState, useCallback, useRef, useEffect } from 'react';
import useEvent from '../tools/useEvent';

const useScore = ({ music: { duration }, time2Timers, scaleRef }) => {
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
        const height = scaleRef.current * duration;
        const top = e.clientY - y;
        const left = e.clientX - x;
        const time = Math.max((1 - top / height) * duration, 0);
        const { key: startTime, value: { beat: startBeat, bpm } } = time2Timers.le(time);
        const beat = startBeat + (time - startTime) / 60 * bpm;
        const lane = left / width * 11 - 2.5;
        const ratioTop = top / height;
        return { top, left, time, beat, lane, ratioTop };
    }, [duration, rect, scaleRef, time2Timers]);

    const keepInView = useCallback((position) => {
        const height = scaleRef.current * duration;
        let viewTop = position - window.innerHeight;
        if (viewTop < 0) viewTop = 0;
        else if (position > height) viewTop = height - window.innerHeight;
        scrollRef.current = viewTop;
    }, [duration, scaleRef]);

    const deflate = useCallback(({ time, lane }) => {
        const { x, width } = rect;
        const y = -scrollRef.current;
        const height = scaleRef.current * duration;
        return {
            x: x + (lane + 2.5) / 11 * width,
            y: y + height * (1 - time / duration),
        };
    }, [duration, rect, scaleRef]);

    const mouseRef = useRef({ clientX: 0, clientY: 0 });
    const updateMouse = useCallback((e) => {
        mouseRef.current = e;
    }, []);
    useEvent(containerEl, 'mousemove', updateMouse);
    
    const params = {
        containerEl, setContainerEl,
        inflate, keepInView, deflate, scrollRef, rect, mouseRef,
    };

    return params;
};

export default useScore;
