import { lazy, Suspense } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import ParticlesBackground from "./components/ParticlesBackground.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const TechStack = lazy(() => import("./sections/TechStack.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));

const SectionLoader = () => (
    <div className="w-full min-h-[40vh] flex items-center justify-center" role="status" aria-label="Loading section">
        <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
    </div>
);

const LazySection = ({ children }) => (
    <ErrorBoundary>
        <Suspense fallback={<SectionLoader />}>{children}</Suspense>
    </ErrorBoundary>
);

const App = () => {
    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <ParticlesBackground />
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
