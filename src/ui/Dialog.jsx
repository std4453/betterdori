import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { CSSTransition } from 'react-transition-group';
import { useForm } from 'react-hook-form';
import cancel from '../assets/cancel.svg';
import submit from '../assets/submit.svg';

const useDialog = () => {
    const [opened, setOpened] = useState(false);
    const [resolve, setResolve] = useState(null);
    const [reject, setReject] = useState(null);
    const open = useCallback(() => {
        setOpened(true);
        return new Promise((resolve, reject) => {
            setResolve(() => resolve);
            setReject(() => reject);
        }).finally(() => {
            setOpened(false);
            setResolve(null);
            setReject(null);
        });
    }, []);
    const res = useMemo(() => ({
        opened, resolve, reject, open,
    }), [open, opened, reject, resolve]);
    return res;
};

const useStyles = makeStyles({
    overlay: {
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 5,
    },
    sheetContainer: {
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 6,
        pointerEvents: 'none',
    },
    sheet: {
        backgroundColor: '#FFF',
        padding: '1em',
        pointerEvents: 'auto',
    },
    horizontal: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
        marginBottom: -10,
    },
    cell: {
        marginTop: 10,
        marginBottom: 10,
        display: 'block',
    },
    title: {
        fontWeight: 'bold',
        fontSize: `${40 / 60}em`,
        lineHeight: `${50 / 40}em`,
        width: `${480 / 40}em`,
    },
    input: {
        outline: 'none',
        border: 'none',
        backgroundColor: '#000',
        color: '#FFF',
        fontSize: `${34 / 60}em`,
        lineHeight: `${50 / 34}em`,
        height: `${50 / 34}em`,
        fontFamily: 'D-DIN',
        fontWeight: 'normal',
        paddingLeft: `${10 / 34}em`,
        width: `${320 / 34}em`,
    },
    text: {
        fontSize: `${32 / 60}em`,
        lineHeight: `${50 / 32}em`,
        height: `${50 / 32}em`,
        fontWeight: 'normal',
        paddingRight: `${60 / 32}em`,
    },
    button: {
        width: `${120 / 60}em`,
        height: `${50 / 60}em`,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        '&:hover::after': {
            content: '\'\'',
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.14)',
        },
        border: 'none',
        outline: 'none',
        fontSize: 'inherit',
    },
    icon: {
        height: '100%',
    },
});

const DialogContext = createContext(null);

function Dialog({ dialog, children }) {
    const classes = useStyles();
    const onClick = useCallback(() => {
        if (dialog.reject) dialog.reject();
    }, [dialog]);
    const form = useForm();
    const context = useMemo(() => ({ ...dialog, form }), [dialog, form]);
    
    return (
        <form onSubmit={form.handleSubmit(dialog.resolve)}>
            <DialogContext.Provider value={context}>
                <CSSTransition
                    in={dialog.opened}
                    timeout={120}
                    classNames="fade"
                    mountOnEnter
                    unmountOnExit>
                    <div className={classes.overlay} onClick={onClick}/>
                </CSSTransition>
                {children}
            </DialogContext.Provider>
        </form>
    );
}

function Sheet({ children }) {
    const classes = useStyles();
    const { opened } = useContext(DialogContext);
    return (
        <CSSTransition
            in={opened}
            timeout={120}
            classNames="scale"
            mountOnEnter
            unmountOnExit>
            <div className={classes.sheetContainer}>
                <div className={classes.sheet}>
                    {children}
                </div>
            </div>
        </CSSTransition>
    );
}

function Horizontal({ children }) {
    const classes = useStyles();
    return (
        <div className={classes.horizontal}>
            {children}
        </div>
    );
}

function Cell({ el: Element = 'div', children, classes, innerRef, ...rest }) {
    const classes2 = useStyles({ classes });
    return (
        <Element className={classes2.cell} ref={innerRef} {...rest}>
            {children}
        </Element>
    );
}

function Title({ children }) {
    const classes = useStyles();
    return (
        <Cell classes={{ cell: classes.title }}>
            {children}
        </Cell>
    );
}

function Input(props) {
    const classes = useStyles();
    const { form: { register } } = useContext(DialogContext);
    return (
        <Cell
            el="input"
            classes={{ cell: classes.input }}
            innerRef={register}
            {...props}/>
    );
}

function Text({ children }) {
    const classes = useStyles();
    return (
        <Cell classes={{ cell: classes.text }}>
            {children}
        </Cell>
    );
}

function Cancel(props) {
    const classes = useStyles();
    const { reject } = useContext(DialogContext);
    return (
        <Cell classes={{ cell: classes.button }} onClick={reject} {...props}>
            <img className={classes.icon} alt="Cancel" src={cancel}/>
        </Cell>
    );
}

function Submit(props) {
    const classes = useStyles();
    return (
        <Cell el="button" type="submit" classes={{ cell: classes.button }} {...props}>
            <img className={classes.icon} alt="Submit" src={submit}/>
        </Cell>
    );
}

export { useDialog, Dialog, Sheet, Horizontal, Cell, Title, Input, Text, Cancel, Submit };
