import Hero from "./sections/Hero.jsx";
import ShowcaseSection from "./sections/ShowcaseSection.jsx";
import NavBar from "./components/NavBar.jsx";
import LogoSection from "./sections/LogoSection.jsx";
import Experience from "./sections/Experience.jsx";
import TechStack from "./sections/TechStack.jsx";
import Contact from "./sections/Contact.jsx";
import Footer from "./sections/Footer.jsx";
import JDAssistant from "./components/JDAssistant.jsx";

const App = () => {
    return (
        <>
            <NavBar />
            <Hero />
            <ShowcaseSection />
            <LogoSection />
            <Experience />
            <TechStack />
            <Contact />
            <Footer />
            <JDAssistant />
        </>
    );
}

export default App;