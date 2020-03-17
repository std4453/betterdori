import React from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
    root: {
        width: '2em',
        height: '2em',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        '&:after': {
            content: '\'\'',
            position: 'absolute',
            pointerEvents: 'none',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            border: '0px solid black',
        },
        '&:hover:after': {
            borderWidth: 5,
        },
    },
    selected: {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    icon: {
        pointerEvents: 'none',
    },
});

function Button({ selected, onClick, icon, ...props }) {
    const classes = useStyles(props);
    return (
        <div
            className={classNames(classes.root, { [classes.selected]: selected })}
            onClick={onClick}>
            <img src={icon} alt="" className={classes.icon}/>
        </div>
    );
}

export default Button;
