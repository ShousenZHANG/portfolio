import { lazy, Suspense } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DeferredSection from "./components/DeferredSection.jsx";

const ParticlesBackground = lazy(() => import("./components/ParticlesBackground.jsx"));
const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const TechStack = lazy(() => import("./sections/TechStack.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));

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
    return (
        <>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Suspense fallback={null}>
                <ParticlesBackground />
            </Suspense>
            <NavBar />
            <main id="main-content">
                <Hero />
                <DeferredSection
                    id="projects"
                    minHeight="68vh"
                    ariaLabel="Featured projects"
                    fallback={<SectionLoader label="Loading projects" />}
                >
                    <LazySection><ShowcaseSection /></LazySection>
                </DeferredSection>
                <JDQuickCheck />
                <LogoSection />
                <Experience />
                <DeferredSection
                    id="skills"
                    minHeight="64vh"
                    ariaLabel="Technical expertise"
                    fallback={<SectionLoader label="Loading skills" />}
                >
                    <LazySection><TechStack /></LazySection>
                </DeferredSection>
                <DeferredSection
                    id="contact"
                    minHeight="64vh"
                    ariaLabel="Contact form"
                    fallback={<SectionLoader label="Loading contact" />}
                >
                    <LazySection><Contact /></LazySection>
                </DeferredSection>
            </main>
            <Footer />
        </>
    );
};

export default App;
