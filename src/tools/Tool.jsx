import React, { useMemo, useState } from 'react';

const ToolContext = React.createContext(null);

function Tools({ children }) {
    const [code, setCode] = useState('player');
    const ctx = useMemo(() => ({ code, setCode }), [code, setCode]);
    return (
        <ToolContext.Provider value={ctx}>
            {children}
        </ToolContext.Provider>
    );
}

export { Tools, ToolContext };

