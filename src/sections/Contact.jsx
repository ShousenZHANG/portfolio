import { useRef, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { Send, Mail, User, MessageSquare, Phone } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TitleHeader from "../components/TitleHeader";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const formRef = useRef(null);
  const sectionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    try {
      await emailjs.sendForm(
          import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
          formRef.current,
          import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
      );

      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      console.error("EmailJS Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <section
          id="contact"
          ref={sectionRef}
          className="relative flex-center section-padding overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-900/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px]" />

        <div className="w-full h-full md:px-20 px-5 relative z-10">
          <TitleHeader
              title="Ping Me Anytime — I Respond Faster Than CI/CD"
              sub="💬 Always open for a quick chat, collaboration, or good idea 🚀"
          />

          <div className="max-w-3xl mx-auto mt-16 bg-[#0d1117]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(56,189,248,0.1)] p-8 md:p-10 transition-all duration-500 hover:shadow-[0_0_45px_rgba(56,189,248,0.25)]">
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sky-300 text-sm font-medium"
                >
                  <User className="w-4 h-4" /> Your Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    disabled={loading}
                    className="bg-[#11141a]/90 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all duration-300 disabled:opacity-60"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sky-300 text-sm font-medium"
                >
                  <Mail className="w-4 h-4" /> Your Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="bg-[#11141a]/90 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all duration-300 disabled:opacity-60"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label
                    htmlFor="message"
                    className="flex items-center gap-2 text-sky-300 text-sm font-medium"
                >
                  <MessageSquare className="w-4 h-4" /> Your Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows="5"
                    required
                    disabled={loading}
                    className="bg-[#11141a]/90 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all duration-300 resize-none disabled:opacity-60"
                />
              </div>

              {/* Button */}
              <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                         bg-sky-600/30 border border-sky-400/40 text-white font-semibold
                         hover:bg-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]
                         transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send
                    className={`w-5 h-5 ${
                        loading ? "animate-pulse" : "group-hover:translate-x-1 transition-transform"
                    }`}
                />
                {loading ? "Sending..." : "Send Message 🚀"}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-transparent to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              {/* Success Message */}
              {sent && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="bg-[#0d1117] border border-sky-400/40 rounded-2xl p-8 shadow-2xl text-center animate-fade-in">
                      <h3 className="text-2xl text-sky-300 font-semibold mb-3">
                        ✅ Message Sent!
                      </h3>
                      <p className="text-white/80 mb-6">
                        Thanks for reaching out — I’ll reply soon 🚀
                      </p>
                      <button
                          onClick={() => setSent(false)}
                          className="px-5 py-2 bg-sky-600/40 rounded-lg hover:bg-sky-500/50 transition-all"
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
