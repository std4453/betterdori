import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import useFrame from '../tools/useFrame';

const useStyles = makeStyles({
    root: {
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

function CanvasNotes({
    time2Notes, music: { duration }, forEachNote, forEachGroup, code,
    containerEl, scale, ranges, division, scrollRef,
}) {
    const classes = useStyles();

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

    const render = useCallback(() => {
        if (!ctx || !canvas) return;
        const { width, height } = canvas;
        const scroll = scrollRef.current;
        // const scroll = containerEl.scrollTop;
        const endTime = duration - scroll / scale;
        const startTime = Math.max(0, endTime - height / scale);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        const params = { ctx, width, height, startTime, endTime, scroll, duration, code, scale };

        renderLanes(params);
        bars.forEach(bar => renderBar(params, bar));
        tapLines.forEach(tapLine => renderTapLine(params, tapLine));
        snakes.forEach(snake => renderSnake(params, snake));
        time2Notes.forEach((time, note) => {
            renderNote(params, time, note);
        });
    }, [bars, canvas, code, containerEl, ctx, duration, scale, snakes, tapLines, time2Notes]);
    useFrame(render);
    
    return (
        <canvas className={classes.root} ref={setCanvas}/>
    );
}

export default CanvasNotes;
