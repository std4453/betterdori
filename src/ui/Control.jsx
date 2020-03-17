import React, { useContext, useCallback } from 'react';
import { ToolContext } from '../tools/Tool';
import Button from './Button';
import { makeStyles } from '@material-ui/styles';
import Toolbar from './Toolbar';

const useStyles = makeStyles({
    root: {
        position: 'relative',
    },
    container: {
        position: 'absolute',
        left: '100%',
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
    },
});

function Control({ code: selectCode, children, ...rest }) {
    const classes = useStyles();
    const { code, setCode } = useContext(ToolContext);
    const onClick = useCallback(() => setCode(selectCode), [selectCode, setCode]);
    const selected = code === selectCode;
    return (
        <div className={classes.root}>
            <Button onClick={onClick} selected={selected} {...rest}/>
            {selected && <div className={classes.container}>
                <Toolbar>
                    {children}
                </Toolbar>
            </div>}
        </div>
    );
}

export default Control;
