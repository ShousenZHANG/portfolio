import { useMagnetic } from "../hooks/useMagnetic.js";

/**
 * Wraps a single interactive child in a magnetic span. The child reaches
 * toward the cursor and springs back. Desktop + reduced-motion gated
 * inside the hook.
 */
const Magnetic = ({ children, strength = 0.4, className = "" }) => {
    const ref = useMagnetic(strength);
    return (
        <span ref={ref} data-magnetic className={`inline-flex ${className}`}>
            {children}
        </span>
    );
};

export default Magnetic;
