import React from 'react';
import { makeStyles } from '@material-ui/styles';

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

function Thumb({ children }) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {children}
        </div>
    );
};

export default Thumb;
