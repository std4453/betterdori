import { useState } from "react"

const useTool = () => {
    const [code, setCode] = useState('player');
    return { code, setCode };
};

export default useTool;
