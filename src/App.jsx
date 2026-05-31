import { lazy, Suspense, useEffect } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import InteractiveBackground from "./components/InteractiveBackground.jsx";
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const TechStack = lazy(() => import("./sections/TechStack.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));

// Warm the heavy chunks during idle time after first paint, so by the
// time the user scrolls to a lazy section the JS is already cached and
// the Suspense fallback never flashes. Browser-default scheduling (no
// network races): runs at low priority, yields to user input.
const prefetchLazyChunks = () => {
    import("./sections/ShowcaseSection.jsx");
    import("./sections/TechStack.jsx");
    import("./sections/Contact.jsx");
};

const SectionLoader = ({ label = "Loading section" }) => (
    <div className="w-full min-h-[40vh] flex items-center justify-center" role="status" aria-label={label}>
        <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
    </div>
);

const LazySection = ({ children }) => (
    <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>{children}</Suspense>
    </ErrorBoundary>
);

const App = () => {
    useSmoothScroll();

    useEffect(() => {
        const schedule =
            typeof window !== "undefined" && "requestIdleCallback" in window
                ? window.requestIdleCallback
                : (cb) => window.setTimeout(cb, 1500);
        const handle = schedule(prefetchLazyChunks, { timeout: 4000 });
        return () => {
            if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
                window.cancelIdleCallback?.(handle);
            } else {
                clearTimeout(handle);
            }
        };
    }, []);

    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <CustomCursor />
            <div className="ed-grid-bg" aria-hidden="true" />
            <InteractiveBackground />
            <NavBar />
            <main id="main-content">
                <Hero />
                <LazySection><ShowcaseSection /></LazySection>
                <JDQuickCheck />
                <LogoSection />
                <Experience />
                <LazySection><TechStack /></LazySection>
                <LazySection><Contact /></LazySection>
            </main>
            <Footer />
        </>
    );
};

export default App;
