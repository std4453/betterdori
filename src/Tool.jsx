import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

const ToolContext = React.createContext(null);

function Tools({ children }) {
    const [code, setCode] = useState(null);
    const ctx = useMemo(() => ({ code, setCode }), [code, setCode]);
    return (
        <ToolContext.Provider value={ctx}>
            {children}
        </ToolContext.Provider>
    );
}

function Tool({ code, keys, onActivate, onDeactivate, ...rest }) {
    const { code: currentCode, setCode } = useContext(ToolContext);
    const [isCurrent, setIsCurrent] = useState(false);
    useEffect(() => {
        if (currentCode !== code && isCurrent) {
            setIsCurrent(false);
            if (onDeactivate) onDeactivate();
        } else if (currentCode === code && !isCurrent) {
            setIsCurrent(true);
            if (onActivate) onActivate();
        }
    }, [currentCode, isCurrent, code, onActivate, onDeactivate]);
    const setMyCode = useCallback(() => setCode(code), [setCode, code]);
    return (
        <KeyboardEventHandler handleKeys={keys} onKeyEvent={setMyCode} {...rest}/>
    );
}

export { Tools, Tool };
