import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Send from "lucide-react/dist/esm/icons/send";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import User from "lucide-react/dist/esm/icons/user";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Github from "lucide-react/dist/esm/icons/github";
import TitleHeader from "../components/TitleHeader";
import Magnetic from "../components/Magnetic.jsx";
import { useScrollReveal } from "../hooks/useScrollReveal";

const INPUT_CLASS =
  "rounded-[var(--r-sm)] px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--sig-line)] focus:border-[var(--sig-line)] transition-all duration-300 disabled:opacity-50";
const INPUT_STYLE = { background: "var(--ink-0)", border: "1px solid var(--hair)", color: "var(--tx-0)" };

const Contact = () => {
  const formRef = useRef(null);
  const sectionRef = useScrollReveal({ y: 40, duration: 0.8 });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const submittedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), 4000);
    const onKey = (e) => { if (e.key === "Escape") setSent(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", onKey); };
  }, [sent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    setSendError("");

    const elapsedMs = Date.now() - submittedAtRef.current;
    if (honeypot || elapsedMs < 1500) {
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
      return;
    }

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setSendError("Failed to send message. Please try again or email me directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="ed-shell pt-[var(--sp-section)] pb-16 md:pb-20">
      <TitleHeader title="Get in Touch" sub="05 / Contact" anchor="contact" align="left" />

      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 mt-10 items-start">
        {/* LEFT — context + direct channels */}
        <div className="flex flex-col">
          <p className="ed-lead">
            Open to full-time roles and interesting collaborations. Quick to
            learn, clear in communication, honest about trade-offs — the
            fastest way to reach me is below, or send a note and I'll reply
            soon.
          </p>

          <div className="flex flex-col gap-3 mt-7">
            <a href="mailto:eddy.zhang24@gmail.com"
               className="group/row flex items-center gap-3 p-3 rounded-[var(--r-sm)] transition-colors"
               style={{ border: "1px solid var(--hair)", background: "var(--ink-1)" }}>
              <span className="w-9 h-9 rounded-[var(--r-xs)] flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--sig-glow)", border: "1px solid var(--sig-line)" }}>
                <Mail className="w-4 h-4" style={{ color: "var(--sig)" }} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--tx-2)" }}>Email</span>
                <span className="block text-sm truncate" style={{ color: "var(--tx-0)" }}>eddy.zhang24@gmail.com</span>
              </span>
            </a>
            <a href="tel:+610468761056"
               className="group/row flex items-center gap-3 p-3 rounded-[var(--r-sm)] transition-colors"
               style={{ border: "1px solid var(--hair)", background: "var(--ink-1)" }}>
              <span className="w-9 h-9 rounded-[var(--r-xs)] flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--sig-glow)", border: "1px solid var(--sig-line)" }}>
                <Phone className="w-4 h-4" style={{ color: "var(--sig)" }} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--tx-2)" }}>Phone</span>
                <span className="block text-sm" style={{ color: "var(--tx-0)" }}>+61 0468 761 056</span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Magnetic strength={0.5}>
              <a href="https://linkedin.com/in/eddy-shousen-zhang" target="_blank" rel="noopener noreferrer"
                 aria-label="LinkedIn" className="w-11 h-11 flex items-center justify-center rounded-[var(--r-sm)] transition-colors hover:!border-[var(--sig-line)] hover:!text-[var(--sig)]"
                 style={{ border: "1px solid var(--hair)", color: "var(--tx-1)" }}>
                <Linkedin className="w-[18px] h-[18px]" />
              </a>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a href="https://github.com/ShousenZHANG" target="_blank" rel="noopener noreferrer"
                 aria-label="GitHub" className="w-11 h-11 flex items-center justify-center rounded-[var(--r-sm)] transition-colors hover:!border-[var(--sig-line)] hover:!text-[var(--sig)]"
                 style={{ border: "1px solid var(--hair)", color: "var(--tx-1)" }}>
                <Github className="w-[18px] h-[18px]" />
              </a>
            </Magnetic>
            <span className="inline-flex items-center gap-2 ml-1 text-sm" style={{ color: "var(--tx-1)" }}>
              <span className="ed-status-dot" aria-hidden="true" />
              Available for work
            </span>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ed-tile p-6 md:p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot */}
            <div aria-hidden="true" className="absolute left-[-10000px] top-auto w-px h-px overflow-hidden">
              <label htmlFor="company-website">Website</label>
              <input type="text" id="company-website" name="company-website" tabIndex="-1" autoComplete="off"
                     value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="flex items-center gap-2 text-sm" style={{ color: "var(--tx-1)" }}>
                  <User className="w-3.5 h-3.5" /> Name
                </label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange}
                       placeholder="Your name" required disabled={loading}
                       className={INPUT_CLASS} style={INPUT_STYLE} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="flex items-center gap-2 text-sm" style={{ color: "var(--tx-1)" }}>
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange}
                       placeholder="your@email.com" required disabled={loading}
                       className={INPUT_CLASS} style={INPUT_STYLE} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="flex items-center gap-2 text-sm" style={{ color: "var(--tx-1)" }}>
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange}
                        placeholder="What would you like to discuss?" rows="5" required disabled={loading}
                        className={`${INPUT_CLASS} resize-none`} style={INPUT_STYLE} />
            </div>

            <button type="submit" disabled={loading} className="ed-btn mt-1 self-start disabled:opacity-50 disabled:cursor-not-allowed" data-magnetic>
              <Send className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Sending…" : "Send Message"}
            </button>

            {sendError && <p className="text-sm" role="alert" style={{ color: "var(--danger-tx)" }}>{sendError}</p>}

            {/* Success dialog */}
            {sent && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
                   role="dialog" aria-labelledby="contact-success-title" aria-modal="true"
                   onClick={() => setSent(false)} onKeyDown={(e) => { if (e.key === "Tab") e.preventDefault(); }}>
                <div className="rounded-[var(--r-lg)] p-8 shadow-2xl text-center max-w-sm mx-4 animate-fade-in"
                     style={{ background: "var(--ink-1)", border: "1px solid var(--hair-bright)" }}
                     onClick={(e) => e.stopPropagation()}>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{ background: "var(--sig-glow)", border: "1px solid var(--sig-line)" }}>
                    <Send className="w-5 h-5" style={{ color: "var(--sig)" }} />
                  </div>
                  <h3 id="contact-success-title" className="text-xl font-semibold mb-2" style={{ color: "var(--tx-0)" }}>
                    Message Sent
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "var(--tx-1)" }}>
                    Thanks for reaching out. I'll get back to you soon.
                  </p>
                  <button type="button" onClick={() => setSent(false)} autoFocus
                          className="px-5 py-2 text-sm rounded-[var(--r-sm)] transition-colors"
                          style={{ background: "var(--ink-2)", border: "1px solid var(--hair-bright)", color: "var(--tx-0)" }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
