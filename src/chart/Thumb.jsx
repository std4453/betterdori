import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useDrag from '../tools/useDrag';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        backgroundColor: '#000000',
        width: '11em',
        fontSize: `${78 / 11}px`,
        right: 0,
        top: 0,
        height: '100%',
        overflow: 'hidden',
    },
});

function Thumb({ children, scale, music: { duration }, containerEl, innerEl }) {
    const classes = useStyles();

    const [thumbEl, setThumbEl] = useState(null);
    const updateScroll = useCallback((e, { left }) => {
        if (!containerEl || !innerEl) return;
        if (!left) return;
        const position = e.clientY / window.innerHeight * duration;
        const viewSize = window.innerHeight / scale; // in seconds
        const { height } = innerEl.getBoundingClientRect();
        let top = (position - viewSize / 2) / duration * height; // in px
        if (top < 0) top = 0;
        if (top + window.innerHeight > height) top = height - window.innerHeight;
        containerEl.scrollTop = top;
    }, [containerEl, duration, innerEl, scale]);
    useDrag({ onDrag: updateScroll, onDragEnd: updateScroll, el: thumbEl });

    return (
        <div className={classes.root} ref={setThumbEl}>
            {children}
        </div>
    );
};

export default Thumb;
