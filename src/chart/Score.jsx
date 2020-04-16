/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useFrame from '../tools/useFrame';

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

function updateView(
    { code, music: { duration, currentTime, paused }, scaleRef: { current: scale }, progressOffset, keepInView, follow },
) {
    if (code !== 'player') return;
    const progress = (duration - currentTime) * scale;
    if (follow && !paused) keepInView(progress + progressOffset);
}

function renderBars(
    { scrollRef: { current: scroll }, music: { duration }, scaleRef: { current: scale }, bars, rect: { width } },
    { ctx, startTime, endTime },
) {
    for (const { time, major } of bars) {
        const laneWidth = width / 11;
        const deltaTime = laneWidth / scale / 2;
        if (time < startTime - deltaTime || time > endTime + deltaTime) continue;
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
}

function renderNotes(
    { rect: { width }, scrollRef: { current: scroll }, music: { duration }, scaleRef: { current: scale }, code, time2Notes },
    { ctx, startTime, endTime },
) {
    time2Notes.forEach((time, { lane, note: type, flick, start, end, thumb, selected }) => {
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
    });
}

function renderTapLines(
    { rect: { width }, scrollRef: { current: scroll }, music: { duration }, scaleRef: { current: scale }, tapLines },
    { ctx, startTime, endTime },
) {
    for (const { time, minLane, maxLane } of tapLines) {
        const laneWidth = width / 11;
        const deltaTime = laneWidth / scale / 2;
        if (time < startTime - deltaTime || time > endTime + deltaTime) continue;
        const cy = (duration - time) * scale - scroll;

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo((minLane + 2.5) * laneWidth, cy);
        ctx.lineTo((maxLane + 2.5) * laneWidth, cy);
        ctx.stroke();
    }
}

function renderSnakes(
    { rect: { width }, scrollRef: { current: scroll }, music: { duration }, scaleRef: { current: scale }, snakes },
    { ctx, startTime, endTime },
) {
    for (const { x0, x1, y0, y1 } of snakes) {
        const laneWidth = width / 11;
        if (y1 < startTime || y0 > endTime) continue;
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
}

function renderLanes(
    { rect: { width }, scale, music: { duration } },
    { ctx },
) {
    const laneWidth = width / 11;
    for (let i = 0; i <= 7; ++i) {
        const side = i === 0 || i === 7;
        ctx.lineWidth = side ? 5 : 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(laneWidth * (i + 2), 0);
        ctx.lineTo(laneWidth * (i + 2), scale * duration);
        ctx.stroke();
    }
}

function renderProgress(
    { music: { duration, currentTime }, scaleRef: { current: scale }, code, scrollRef: { current: scroll }, rect: { width } },
    { ctx },
) {
    if (code !== 'player') return;
    const progress = (duration - currentTime) * scale - scroll;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF4E67';
    ctx.beginPath();
    ctx.moveTo(0, progress);
    ctx.lineTo(width, progress);
    ctx.stroke();
}

function renderPlacementCaret(
    { quantize, rect: { width }, music: { duration }, scaleRef: { current: scale }, scrollRef: { current: scroll }, code },
    { ctx, mouse: { time } },
) {
    if (!code.startsWith('placement/') && !code.startsWith('modification/') && code !== 'timer') return;
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
    { rect: { width }, scrollRef: { current: scroll }, scaleRef: { current: scale }, music: { duration }, code, countNotes },
    { ctx, mouse: { time } },
) {
    if (code !== 'player') return;
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
    { time2Timers, scrollRef: { current: scroll }, music: { duration }, scaleRef: { current: scale }, rect: { width } },
    { ctx, startTime, endTime },
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
        ctx.beginPath();
        const cx = (9 + 0.55) * laneWidth;
        const cy = window.innerHeight - 0.14 * laneWidth;
        // console.log(cx, cy);
        ctx.moveTo(cx - 5, cy - 3);
        ctx.lineTo(cx + 5, cy - 3);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();
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
        ctx.fillText(`${bpm}`, (9 + 0.15) * laneWidth, cy + 0.2 * laneWidth);
    });
}

function Score(props) {
    const { scaleRef, setContainerEl, scrollRef, music: { duration }, inflate, mouseRef } = props;

    const classes = useStyles();

    const onContextMenu = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

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
    
    const render = () => {
        if (!ctx || !canvas) return;
        
        const { width, height } = canvas;
        const endTime = duration - scrollRef.current / scaleRef.current;
        const startTime = Math.max(0, endTime - height / scaleRef.current);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        updateView(props);

        const params = {
            ctx, startTime, endTime, mouse: inflate(mouseRef.current),
        };

        renderLanes(props, params);
        renderBars(props, params);
        renderTimers(props, params);
        renderTapLines(props, params);
        renderSnakes(props, params);
        renderProgress(props, params);
        renderPlacementCaret(props, params);
        renderPlayerCaret(props, params);
        renderNotes(props, params);
    }
    useFrame(render);

    return (
        <div
            ref={setContainerEl}
            className={classes.root}
            onContextMenu={onContextMenu}>
            <canvas className={classes.canvas} ref={setCanvas}/>
        </div>
    );
};

export default Score;
