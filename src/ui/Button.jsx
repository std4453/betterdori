import React, { useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { ToolContext } from '../tools/Tool';

const useStyles = makeStyles({
    root: {
        width: '2em',
        height: '2em',
        cursor: 'pointer',
        '&:hover $icon': {
            transform: 'scale(1.1)',
        },
    },
    selected: {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
    icon: {
        pointerEvents: 'none',
        transition: 'transform 70ms ease-in-out',
        // transform: 'scale(1.0)',
    },
});

function Button({ code: selectCode, icon }) {
    const classes = useStyles();
    const { code, setCode } = useContext(ToolContext);
    const onClick = useCallback(() => setCode(selectCode), [setCode, selectCode]);
    return (
        <div
            className={classNames(classes.root, { [classes.selected]: code === selectCode })}
            onClick={onClick}>
            <img src={icon} alt={code} className={classes.icon}/>
        </div>
    );
}

export default Button;
