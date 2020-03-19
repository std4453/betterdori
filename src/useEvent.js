import { useEffect } from "react";

const useEvent = (el, name, fn) => {
    useEffect(() => {
        if (!el) return;
        let valid = true;
        const wrappedFn = (e) => {
            if (!valid) return;
            if (fn) fn(e);
        }
        el.addEventListener(name, wrappedFn);
        return () => el.removeEventListener(name, wrappedFn);
    }, [el, fn, name]);
}

export default useEvent;
