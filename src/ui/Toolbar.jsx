import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '2em',
    },
});

function Toolbar({ children }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
}

export default Toolbar;
