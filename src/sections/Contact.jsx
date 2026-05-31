import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import Send from "lucide-react/dist/esm/icons/send";
import Mail from "lucide-react/dist/esm/icons/mail";
import User from "lucide-react/dist/esm/icons/user";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import TitleHeader from "../components/TitleHeader";
import { useScrollReveal } from "../hooks/useScrollReveal";

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
    const onKey = (e) => {
      if (e.key === "Escape") setSent(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
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

    // Bot heuristics — silently "succeed" so bots don't retry/learn:
    // 1) Honeypot field filled (humans never see it).
    // 2) Form submitted within 1.5s of mount (humans take longer).
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
    <section
      id="contact"
      ref={sectionRef}
      className="ed-shell py-[var(--sp-section)]"
    >
      <div className="max-w-[720px] mx-auto">
        <TitleHeader
          title="Get in Touch"
          sub="05 / Contact"
          anchor="contact"
          align="left"
        />

        <div className="mt-10 ed-tile p-6 md:p-8">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* Honeypot — hidden from humans, visible to naive bots */}
            <div aria-hidden="true" className="absolute left-[-10000px] top-auto w-px h-px overflow-hidden">
              <label htmlFor="company-website">Website</label>
              <input
                type="text"
                id="company-website"
                name="company-website"
                tabIndex="-1"
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Name + Email row on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-white/75 text-sm"
                >
                  <User className="w-3.5 h-3.5" /> Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={loading}
                  className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--sig-line)] focus:ring-1 focus:ring-[var(--sig-line)] transition-all duration-300 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-white/75 text-sm"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--sig-line)] focus:ring-1 focus:ring-[var(--sig-line)] transition-all duration-300 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="flex items-center gap-2 text-white/75 text-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What would you like to discuss?"
                rows="4"
                required
                disabled={loading}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--sig-line)] focus:ring-1 focus:ring-[var(--sig-line)] transition-all duration-300 resize-none disabled:opacity-50 placeholder:text-white/30"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="ed-btn mt-2 self-start disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
              {loading ? "Sending..." : "Send Message"}
            </button>

            {/* Error */}
            {sendError && (
              <p className="text-red-400 text-sm" aria-live="polite">{sendError}</p>
            )}

            {/* Success dialog */}
            {sent && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
                role="dialog"
                aria-labelledby="contact-success-title"
                aria-modal="true"
                onClick={() => setSent(false)}
              >
                <div
                  className="bg-[#0d0f15] border border-white/10 rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 id="contact-success-title" className="text-xl text-white font-semibold mb-2">
                    Message Sent
                  </h3>
                  <p className="text-white/75 text-sm mb-6">
                    Thanks for reaching out. I'll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    autoFocus
                    className="px-5 py-2 bg-white/10 border border-white/15 text-white text-sm rounded-lg hover:bg-white/15 transition-all"
                  >
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
