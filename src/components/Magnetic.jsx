import { useMagnetic } from "../hooks/useMagnetic.js";

/**
 * Wraps a single interactive child in a magnetic span. The child reaches
 * toward the cursor and springs back. Desktop + reduced-motion gated
 * inside the hook.
 */
const Magnetic = ({ children, strength = 0.4, className = "inline-flex" }) => {
    const ref = useMagnetic(strength);
    // className fully controls display — callers that need to hide on
    // mobile pass "hidden lg:inline-flex" without an always-on inline-flex
    // base fighting the `hidden` utility.
    return (
        <span ref={ref} data-magnetic className={className}>
            {children}
        </span>
    );
};

export default Magnetic;
