import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
    },
});

function Notes({ notes, duration }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
        </div>
    );
}

export default Notes;
