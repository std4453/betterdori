import { useCallback, useEffect } from 'react';
import useEvent from '../tools/useEvent';
import { normalizeWheel } from '../utils';

function Navigation({
    music: { duration }, scaleRef, scaleSpeed, minScale, maxScale, scrollSpeed, scrollRef, containerEl,
}) {
    // scale = pixels per second
    const onWheel = useCallback((e) => {
        const { pixelY } = normalizeWheel(e);
        const scale = scaleRef.current;
        if (e.ctrlKey) { // scaling
            const height = scale * duration;
            // scaling keeps the cursor unmoved, that is, 
            const ratio = (e.clientY + scrollRef.current) / height;
            // scale changes on a proportional basis, a same scroll distance
            // results in a same proportion of scale change.
            let newScale = scale * (1 - pixelY * scaleSpeed);
            if (newScale < minScale) newScale = minScale;
            if (newScale > maxScale) newScale = maxScale;
            const newHeight = newScale * duration;
            let newScroll = ratio * newHeight - e.clientY;
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > newHeight) newScroll = newHeight - window.innerHeight;
            scrollRef.current = newScroll;
            scaleRef.current = newScale;
        } else {
            const height = scale * duration;
            // scroll changes proportional to scale, a same scroll distance
            // results in a same scroll change measured in *beats*. 
            let newScroll = scrollRef.current + pixelY * scrollSpeed * Math.sqrt(scale);
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > height) newScroll = height - window.innerHeight;
            scrollRef.current = newScroll;
        }
    }, [scaleRef, duration, scrollRef, scaleSpeed, minScale, maxScale, scrollSpeed]);
    // prevent default ctrl+wheel zoom, for details about the { passive: false } option
    // in addEventListener, see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    useEffect(() => {
        const prevent = (e) => {
            if (!e.ctrlKey) return;
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        window.addEventListener('wheel', prevent, { passive: false });
        return () => window.removeEventListener('wheel', prevent);
    }, []);
    useEvent(containerEl, 'wheel', onWheel);

    // jump to scroll bottom initially
    useEffect(() => {
        const height = duration * scaleRef.current;
        scrollRef.current = height - window.innerHeight;
    }, [duration, scaleRef, scrollRef]);

    return null;
}

export default Navigation;
