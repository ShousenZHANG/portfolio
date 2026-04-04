import { lazy, Suspense } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import ParticlesBackground from "./components/ParticlesBackground.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const TechStack = lazy(() => import("./sections/TechStack.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));
const JDAssistant = lazy(() => import("./components/JDAssistant.jsx"));

const SectionLoader = () => (
    <div className="w-full min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
    </div>
);

const App = () => {
    return (
        <>
            <ParticlesBackground />
            <NavBar />
            <Hero />
            <Suspense fallback={<SectionLoader />}>
                <ShowcaseSection />
            </Suspense>
            <JDQuickCheck />
            <LogoSection />
            <Experience />
            <Suspense fallback={<SectionLoader />}>
                <TechStack />
            </Suspense>
            <Suspense fallback={<SectionLoader />}>
                <Contact />
            </Suspense>
            <Footer />
            <Suspense fallback={null}>
                <JDAssistant />
            </Suspense>
        </>
    );
};

export default App;
