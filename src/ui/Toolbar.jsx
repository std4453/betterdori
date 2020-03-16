import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Button from './Button';
import { buttons } from './config';

const useStyles = makeStyles({
    root: {
        position: 'relative',
        width: '2em',
        fontSize: 40,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
});

function Toolbar() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {buttons.map(button => (
                <Button {...button} key={button.code}/>
            ))}
        </div>
    );
}

export default Toolbar;
