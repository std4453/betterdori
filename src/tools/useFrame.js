import { useEffect } from "react";

const useFrame = (fn) => {
    useEffect(() => {
        let valid = true;
        const onFrameWrapped = () => {
            if (fn) fn();
            if (valid) requestAnimationFrame(onFrameWrapped);
        };
        requestAnimationFrame(onFrameWrapped);
        return () => { valid = false; };
    }, [fn]);
}

export default useFrame;
