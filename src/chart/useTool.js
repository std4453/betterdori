import { useState } from "react"

const useTool = () => {
    const [code, setCode] = useState('select');
    return { code, setCode };
};

export default useTool;
