import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
    },
});

function Snake({ x0, x1, y0, y1 }) {
    const classes = useStyles();
    return <div
        className={classes.root}
        style={{
            bottom: `${y0 * 100}%`,
            top: `${(1 - y1) * 100}%`,
        }}>
        <svg width="100%" height="100%" viewBox="0 0 7 1" preserveAspectRatio="none">
            <polygon
                fill="rgba(122, 222, 174, 0.4)"
                strokeWidth="0"
                points={`${x0},1 ${x0 + 1},1 ${x1 + 1},0 ${x1},0`}/>
        </svg>
    </div>;
}

export default Snake;