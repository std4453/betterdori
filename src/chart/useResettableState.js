import { useState, useEffect } from "react"

const useResettableState = (initial) => {
    const [value, setValue] = useState(initial);
    useEffect(() => {
        setValue(initial);
    }, [initial]);
    return [value, setValue];
}

export default useResettableState;
