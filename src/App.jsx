import { lazy, Suspense } from "react";
import Hero from "./sections/Hero.jsx";
import NavBar from "./components/NavBar.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import Footer from "./sections/Footer.jsx";
import JDQuickCheck from "./sections/JDQuickCheck.jsx";

const ShowcaseSection = lazy(() => import("./sections/ShowcaseSection.jsx"));
const TechStack = lazy(() => import("./sections/TechStack.jsx"));
const Contact = lazy(() => import("./sections/Contact.jsx"));
const JDAssistant = lazy(() => import("./components/JDAssistant.jsx"));

const App = () => {
    return (
        <>
            <NavBar />
            <Hero />
            <Suspense fallback={null}>
                <ShowcaseSection />
            </Suspense>
            <JDQuickCheck />
            <LogoSection />
            <Experience />
            <Suspense fallback={null}>
                <TechStack />
            </Suspense>
            <Suspense fallback={null}>
                <Contact />
            </Suspense>
            <Footer />
            <Suspense fallback={null}>
                <JDAssistant />
            </Suspense>
        </>
    );
}

export default App;