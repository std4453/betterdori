/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { normalizeWheel } from '../utils';
import useFrame from '../tools/useFrame';
import useEvent from '../tools/useEvent';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: '11em',
        fontSize: `${470 / 11}px`,
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
        willChange: 'scroll-position',
    },
    canvas: {
        position: 'fixed',
        left: '25vw',
        top: 0,
    },
});

function renderBar(
    { ctx, width, startTime, endTime, scroll, duration, scale },
    { time, major },
) {
    const laneWidth = width / 11;
    const deltaTime = laneWidth / scale / 2;
    if (time < startTime - deltaTime || time > endTime + deltaTime) return;
    const cy = (duration - time) * scale - scroll;

    ctx.lineWidth = 1;
    ctx.strokeStyle = major ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.setLineDash(major ? [] : [2, 2]);
    ctx.moveTo(laneWidth * 2, cy);
    ctx.lineTo(laneWidth * 9, cy);
    ctx.stroke();
    ctx.setLineDash([]);
}

function renderNote(
    { ctx, width, startTime, endTime, scroll, duration, scale, code },
    time, { lane, note: type, flick, start, end, thumb, selected },
) {
    const laneWidth = width / 11;
    const deltaTime = laneWidth / scale / 2;
    if (time < startTime - deltaTime || time > endTime + deltaTime) return;
    const cx = (lane + 2.5) * laneWidth; // center x
    const cy = (duration - time) * scale - scroll;

    const single = type === 'Single';
    const slide = type === 'Slide';
    const full = start || end;
    const focusable = !thumb
        && (code.startsWith('placement/')
        || code.startsWith('modification/')
        || code === 'select');
    const middle = slide && !full;
    const selecting = code === 'select';

    if (single && !flick) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx, cy, laneWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (slide && full && !flick) {
        ctx.fillStyle = '#7ADEAE';
        ctx.beginPath();
        ctx.arc(cx, cy, laneWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (flick) {
        ctx.fillStyle = '#FFA0E8';
        ctx.beginPath();
        ctx.arc(cx, cy, laneWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (middle && (!selecting || !selected)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#7ADEAE';
        ctx.beginPath();
        ctx.moveTo(cx - laneWidth / 2, cy);
        ctx.lineTo(cx + laneWidth / 2, cy);
        ctx.stroke();
    }

    if (middle && selected && selecting) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5996FF';
        ctx.beginPath();
        ctx.moveTo(cx - laneWidth / 2, cy);
        ctx.lineTo(cx + laneWidth / 2, cy);
        ctx.stroke();
    }

    if (selected && selecting && !middle) {
        const size = laneWidth / 60 * 7;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5996FF';
        ctx.beginPath();
        ctx.moveTo(cx - size, cy - size);
        ctx.lineTo(cx + size, cy + size);
        ctx.moveTo(cx + size, cy - size);
        ctx.lineTo(cx - size, cy + size);
        ctx.stroke();
    }

    if (focusable) {
        // focus
    }
}

function renderTapLine(
    { ctx, width, startTime, endTime, scroll, duration, scale },
    { time, minLane, maxLane },
) {
    const laneWidth = width / 11;
    const deltaTime = laneWidth / scale / 2;
    if (time < startTime - deltaTime || time > endTime + deltaTime) return;
    const cy = (duration - time) * scale - scroll;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo((minLane + 2.5) * laneWidth, cy);
    ctx.lineTo((maxLane + 2.5) * laneWidth, cy);
    ctx.stroke();
}

function renderSnake(
    { ctx, width, startTime, endTime, scroll, duration, scale },
    { x0, x1, y0, y1 },
) {
    const laneWidth = width / 11;
    if (y1 < startTime || y0 > endTime) return;
    const cx0 = (x0 + 2.5) * laneWidth;
    const cx1 = (x1 + 2.5) * laneWidth;
    const cy0 = (duration - y0) * scale - scroll;
    const cy1 = (duration - y1) * scale - scroll;

    ctx.fillStyle = 'rgba(122, 222, 174, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx0 - laneWidth / 2, cy0);
    ctx.lineTo(cx0 + laneWidth / 2, cy0);
    ctx.lineTo(cx1 + laneWidth / 2, cy1);
    ctx.lineTo(cx1 - laneWidth / 2, cy1);
    ctx.closePath();
    ctx.fill();
}

function renderLanes(
    { ctx, width, height },
) {
    const laneWidth = width / 11;
    for (let i = 0; i <= 7; ++i) {
        const side = i === 0 || i === 7;
        ctx.lineWidth = side ? 5 : 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(laneWidth * (i + 2), 0);
        ctx.lineTo(laneWidth * (i + 2), height);
        ctx.stroke();
    }
}

function renderProgress({ ctx, width }, progress) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF4E67';
    ctx.beginPath();
    ctx.moveTo(0, progress);
    ctx.lineTo(width, progress);
    ctx.stroke();
}

function renderPlacementCaret(
    { ctx, quantize, mouse: { time }, width, duration, scale, scroll },
) {
    const { time: quantizedTime, beat } = quantize(time);
    const laneWidth = width / 11;
    const cy = (duration - quantizedTime) * scale - scroll;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5996FF';
    ctx.beginPath();
    ctx.moveTo(laneWidth * 2, cy);
    ctx.lineTo(laneWidth * 9, cy);
    ctx.stroke();

    ctx.fillStyle = '#5996FF';
    ctx.font = `${laneWidth * 0.6}px D-Din`;
    ctx.textAlign = 'end';
    ctx.fillText(`${beat.toFixed(2)}'`, laneWidth * 2 - laneWidth * 0.15, cy + laneWidth * 0.3);
}

function renderPlayerCaret(
    { ctx, mouse: { time }, width, scroll, scale, duration, countNotes },
) {
    const laneWidth = width / 11;
    const cy = (duration - time) * scale - scroll;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#5996FF';
    ctx.beginPath();
    ctx.moveTo(laneWidth * 2, cy);
    ctx.lineTo(laneWidth * 9, cy);
    ctx.stroke();

    ctx.fillStyle = '#5996FF';
    ctx.font = `${laneWidth * 0.6}px D-Din`;
    ctx.textAlign = 'end';
    ctx.fillText(`${countNotes(time)}`, laneWidth * (2 - 0.15), cy + laneWidth * 0.3);
}

function renderTimers(
    { ctx, width, scroll, duration, scale, startTime, endTime },
    time2Timers,
) {
    const laneWidth = width / 11;
    const deltaTime = laneWidth / scale / 2;
    ctx.fillStyle = '#FFCD18';
    ctx.textAlign = 'start';
    ctx.font = `${laneWidth * 0.6}px D-Din`;

    const bottomTime = Math.max(duration - (scroll + window.innerHeight) / scale, 0);
    const threshold = 1.25;
    const { key: nextTime, valid } = time2Timers.gt(bottomTime);
    if (valid && (nextTime - bottomTime) >= laneWidth * threshold / scale) {
        const { value: { bpm } } = time2Timers.le(bottomTime);
        ctx.fillText(`${bpm}`, (9 + 0.15) * laneWidth, window.innerHeight - 0.36 * laneWidth);
    }

    ctx.strokeStyle = '#FFCD18';
    ctx.lineWidth = 3;
    time2Timers.forEach((time, { bpm }) => {
        if (time < startTime - deltaTime || time > endTime + deltaTime) return;
        const cy = (duration - time) * scale - scroll;
        ctx.beginPath();
        ctx.moveTo(2 * laneWidth, cy);
        ctx.lineTo(9 * laneWidth, cy);
        ctx.stroke();
        ctx.fillText(`${bpm}`, (9 + 0.15) * laneWidth, cy + 0.3 * laneWidth);
    });
}

function Score({
    music, scale, setScale, scaleSpeed, minScale, maxScale, scrollSpeed,
    setContainerEl, scrollRef,
    time2Notes, music: { duration }, forEachNote, forEachGroup, code,
    ranges, division, follow, keepInView, progressOffset,
    inflate, containerEl, quantize, countNotes, time2Timers,
}) {
    const classes = useStyles();

    // scale = pixels per second
    const onWheel = useCallback((e) => {
        const { pixelY } = normalizeWheel(e.nativeEvent);
        if (e.ctrlKey) { // scaling
            const height = scale * music.duration;
            // scaling keeps the cursor unmoved, that is, 
            const ratio = (e.clientY + scrollRef.current) / height;
            // scale changes on a proportional basis, a same scroll distance
            // results in a same proportion of scale change.
            let newScale = scale * (1 - pixelY * scaleSpeed);
            if (newScale < minScale) newScale = minScale;
            if (newScale > maxScale) newScale = maxScale;
            const newHeight = newScale * music.duration;
            let newScroll = ratio * newHeight - e.clientY;
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > newHeight) newScroll = newHeight - window.innerHeight;
            scrollRef.current = newScroll;
            setScale(newScale);
        } else {
            const height = scale * music.duration;
            // scroll changes proportional to scale, a same scroll distance
            // results in a same scroll change measured in *beats*. 
            let newScroll = scrollRef.current + pixelY * scrollSpeed * Math.sqrt(scale);
            // keep whole score in viewport
            if (newScroll < 0) newScroll = 0;
            if (newScroll + window.innerHeight > height) newScroll = height - window.innerHeight;
            scrollRef.current = newScroll;
        }
    }, [scale, music.duration, scrollRef, scaleSpeed, minScale, maxScale, setScale, scrollSpeed]);
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

    // jump to scroll bottom initially, use getBoundingClientRect() so that this
    // will run only once, upon mounting (instead of every time scale changes).
    useEffect(() => {
        const height = music.duration * scale;
        // const { height } = innerEl.getBoundingClientRect();
        scrollRef.current = height - window.innerHeight;
        // containerEl.scrollTop = height - window.innerHeight;
    }, [scrollRef]);

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const snakes = useMemo(() => {
        const res = [];
        ['A', 'B'].forEach((pos) => {
            let lastY = 0, lastLane = -1;
            forEachNote((time, { lane, end }) => {
                if (lastLane !== -1) {
                    const y1 = time;
                    res.push({
                        x0: lastLane, x1: lane,
                        y0: lastY, y1,
                    });
                }
                lastLane = end ? -1 : lane;
                lastY = time;
            }, { pos, note: 'Slide' });
        });
        return res;
    }, [forEachNote]);

    const tapLines = useMemo(() => {
        const res = [];
        forEachGroup((time, notes) => {
            let minLane = 8, maxLane = -1;
            for (const { lane, note: type, start, end } of notes) {
                // Synchronus tap line appears two notes possess the same beat,
                // but middle slide notes are not counted
                if (type !== 'Slide' || start || end) {
                    minLane = Math.min(minLane, lane);
                    maxLane = Math.max(maxLane, lane);
                }
            }
            if (minLane < maxLane - 1) { // at least two notes, distance >= 2, display sync tap line
                res.push({
                    time, minLane, maxLane,
                });
            }
        });
        return res;
    }, [forEachGroup]);

    const bars = useMemo(() => {
        const bars = [];
        for (const { beat1, beat2, bpm, time1 } of ranges) {
            for (let beat = beat1; beat < beat2; beat += 1 / division) {
                const deltaBeat = beat - beat1;
                const time = time1 + deltaBeat / bpm * 60;
                // use epsilon to avoid round off errors
                const major = Math.abs(Math.round(deltaBeat) - deltaBeat) < 1e-5;
                bars.push({
                    time, major,
                });
            }
        }
        return bars;
    }, [ranges, division]);

    const [canvas, setCanvas] = useState(null);
    const ctx = useMemo(() => {
        if (!canvas) return null;
        return canvas.getContext('2d');
    }, [canvas]);
    useEffect(() => {
        if (!canvas) return;
        canvas.width = 470;
        canvas.height = window.innerHeight;
    }, [canvas]);

    const mouseRef = useRef({ clientX: 0, clientY: 0 });
    const updateMouse = useCallback((e) => {
        mouseRef.current = e;
    }, []);
    useEvent(containerEl, 'mousemove', updateMouse);

    const render = useCallback(() => {
        if (!ctx || !canvas) return;

        const progress = (duration - music.currentTime) * scale;
        if (follow && !music.paused) keepInView(progress + progressOffset);

        const { width, height } = canvas;
        const scroll = scrollRef.current;
        const endTime = duration - scroll / scale;
        const startTime = Math.max(0, endTime - height / scale);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        const params = {
            ctx, width, height, startTime, endTime, scroll, duration, code, scale,
            quantize, mouse: inflate(mouseRef.current), countNotes,
        };

        renderLanes(params);
        bars.forEach(bar => renderBar(params, bar));
        renderTimers(params, time2Timers);
        tapLines.forEach(tapLine => renderTapLine(params, tapLine));
        snakes.forEach(snake => renderSnake(params, snake));
        time2Notes.forEach((time, note) => {
            renderNote(params, time, note);
        });
        if (code === 'player') {
            renderProgress(params, progress - scroll);
        }
        if (code.startsWith('placement/') || code.startsWith('modification/') || code === 'timer') {
            renderPlacementCaret(params);
        }
        if (code === 'player') {
            renderPlayerCaret(params);
        }
    }, [bars, canvas, code, countNotes, ctx, duration, follow, inflate, keepInView, music, progressOffset, quantize, scale, scrollRef, snakes, tapLines, time2Notes, time2Timers]);
    useFrame(render);

    return (
        <div
            ref={setContainerEl}
            className={classes.root}
            onWheel={onWheel}
            onContextMenu={onContextMenu}>
            <canvas className={classes.canvas} ref={setCanvas}/>
        </div>
    );
};

export default Score;
