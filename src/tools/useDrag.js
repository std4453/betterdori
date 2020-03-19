import { useEffect, useMemo, useCallback } from 'react';

const interpolateInterval = 15;

const useDrag = ({ onDragStart, onDrag, onDragEnd, el }) => {
    const states = useMemo(() => ({
        left: false, right: false, dragging: false, shift: false,
        lestX: 0, lastY: 0,
    }), []);

    const onMouseDown = useCallback((e) => {
        if (e.button === 0) states.left = true;
        if (e.button === 2) states.right = true;
        states.shift = e.shiftKey;
        states.lastX = e.clientX;
        states.lastY = e.clientY;
        if (!states.dragging) {
            states.dragging = true;
            if (onDragStart) onDragStart(e, states);
        }
        e.preventDefault();
        e.stopPropagation();
    }, [onDragStart, states]);

    const onMouseMove = useCallback((e) => {
        // due to browser mechanics, the mousemove event itself
        // is throttled, so if the mouse moves too fase, two subsequent mousemove
        // events will have a very large gap, and some notes that are located
        // on the path of the mouse would be lost.
        // the solution is to interpolate manually, if two mousemove events come
        // with a big gap, the path is split into many segments, and fake events
        // are added so that the path looks smooth to onDrag.
        states.shift = e.shiftKey;
        if (states.dragging) {
            // here, the end point is always given to onDrag
            let steps = Math.round(Math.abs(e.clientY - states.lastY) / interpolateInterval);
            if (steps === 0) steps = 1;
            for (let i = 1; i <= steps; ++i) {
                const t = i / steps;
                const clientX = states.lastX + (e.clientX - states.lastX) * t;
                const clientY = states.lastY + (e.clientY - states.lastY) * t;
                if (onDrag) onDrag({ clientX, clientY }, states);
            }
            states.lastX = e.clientX;
            states.lastY = e.clientY;
        }
        e.preventDefault();
        e.stopPropagation();
    }, [onDrag, states]);

    const onMouseUp = useCallback((e) => {
        if (states.dragging) {
            if (onDragEnd) onDragEnd(e, states);
            states.dragging = false;
        }
        // shift = e.shiftKey;
        if (e.button === 0) states.left = false;
        if (e.button === 2) states.right = false;
        e.preventDefault();
        e.stopPropagation();
    }, [onDragEnd, states]);

    useEffect(() => {
        if (!el) return;
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('mouseup', onMouseUp);
        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('mouseup', onMouseUp);
        };
    }, [el, onMouseDown, onMouseMove, onMouseUp]);
};

export default useDrag;
