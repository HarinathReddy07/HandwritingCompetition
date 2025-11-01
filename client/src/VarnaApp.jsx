import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

const API_BASE = typeof window !== "undefined" && window.__api_base ? window.__api_base : "";

async function apiFetch(path, { method = "GET", body, token, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(typeof data === "string" ? data : data?.error || "Request failed");
  return data;
}

function Modal({ open, onClose, title, message, tone = "success" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className={`mb-4 text-lg font-semibold ${tone === "error" ? "text-red-700" : "text-[#912920]"}`}>{title}</div>
        <div className="mb-6 text-sm text-[#0f172a]">{message}</div>
        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-md bg-[#912920] px-4 py-2 text-white hover:opacity-90">OK</button>
        </div>
      </div>
    </div>
  );
}

// Small helper: fade-in on scroll
function FadeInSection({ children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {children}
    </div>
  );
}

// Animated counter
function AnimatedCounter({ to = 100000, duration = 1500, className = "" }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const from = 0;
        const animate = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(from + (to - from) * eased));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className}>{val.toLocaleString('en-IN')}</span>;
}

function Header({ page, setPage, user }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-gradient-to-r from-[#ffffff] to-[#e5e7eb] shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1.5 bg-[#912920]" />
          <div className="text-xl font-bold tracking-wide text-[#0f172a]">VARNA</div>
        </div>
        <nav className="hidden gap-6 md:flex">
          <button onClick={() => setPage("home")} className={`text-sm ${page === "home" ? "text-[#912920] font-semibold" : "text-[#0f172a]"}`}>Home</button>
          <button onClick={() => setPage("register-individual")} className={`text-sm ${page === "register-individual" ? "text-[#912920] font-semibold" : "text-[#0f172a]"}`}>Register (Student)</button>
          <button onClick={() => setPage("register-school")} className={`text-sm ${page === "register-school" ? "text-[#912920] font-semibold" : "text-[#0f172a]"}`}>Register (School)</button>
        </nav>
        <div className="hidden md:block">
          <button onClick={() => setPage(user && !user.isAnonymous ? "admin-panel" : "admin-login")} className="rounded-md bg-[#912920] px-3 py-2 text-sm font-medium text-white hover:bg-[#912920] active:bg-[#0f172a]">
            {user && !user.isAnonymous ? "Admin Panel" : "Admin Login"}
          </button>
        </div>
      </div>
      <div className="border-t border-[#e5e7eb] md:hidden">
        <div className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 py-2">
          <button onClick={() => setPage("home")} className={`whitespace-nowrap rounded px-3 py-1 text-sm ${page === "home" ? "bg-[#912920] text-white" : "bg-gray-100 text-[#0f172a]"}`}>Home</button>
          <button onClick={() => setPage("register-individual")} className={`whitespace-nowrap rounded px-3 py-1 text-sm ${page === "register-individual" ? "bg-[#912920] text-white" : "bg-gray-100 text-[#0f172a]"}`}>Register (Student)</button>
          <button onClick={() => setPage("register-school")} className={`whitespace-nowrap rounded px-3 py-1 text-sm ${page === "register-school" ? "bg-[#912920] text-white" : "bg-gray-100 text-[#0f172a]"}`}>Register (School)</button>
          <button onClick={() => setPage(user && !user.isAnonymous ? "admin-panel" : "admin-login")} className="whitespace-nowrap rounded bg-[#912920] px-3 py-1 text-sm text-white">{user && !user.isAnonymous ? "Admin Panel" : "Admin Login"}</button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e5e7eb] bg-gradient-to-r from-[#ffffff] to-[#e5e7eb] shadow-inner">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
        <div>
          <div className="mb-2 text-sm font-semibold text-[#0f172a]">Contact</div>
          <div className="text-sm text-[#0f172a]">Email: info@vedanshgroup.in</div>
          <div className="text-sm text-[#0f172a]">Phone: +91-00000-00000</div>
          <div className="text-sm text-[#0f172a]">Website: www.vedanshgroup.in</div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-[#0f172a]">Organizer</div>
          <div className="text-sm text-[#0f172a]">Vedansh Group</div>
        </div>
        <div className="flex items-start justify-start md:justify-end">
          <span className="rounded bg-[#f39c12] px-3 py-1 text-xs font-semibold text-white">#VARNA</span>
        </div>
      </div>
    </footer>
  );
}

function Hero({ onRegister }) {
  return (
    <section className="relative overflow-hidden bg-[#ffffff]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl transition-opacity duration-1000 opacity-100">VARNA: Handwriting Champion</h1>
            <p className="mb-6 text-[#0f172a]">A celebration of penmanship and expression for students across Primary, Middle, and High School categories.</p>
            <div className="flex gap-3">
              <button onClick={() => onRegister("register-individual")} className="rounded-md bg-[#912920] px-4 py-2 text-sm font-medium text-white hover:bg-[#912920] active:bg-[#0f172a] transform transition hover:-translate-y-0.5 hover:shadow-lg">Register (Student)</button>
              <button onClick={() => onRegister("register-school")} className="rounded-md border border-[#912920] px-4 py-2 text-sm font-medium text-[#912920] hover:bg-[#912920] hover:text-white active:bg-[#0f172a] transform transition hover:-translate-y-0.5 hover:shadow-lg">Register (School)</button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f39c12]/20" />
            <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-[#912920]/20" />
            <div className="relative rounded-lg border border-[#e5e7eb] p-6 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-[#0f172a]">Competition Timeline</div>
              <table className="w-full text-left text-sm text-[#0f172a]">
                <thead>
                  <tr className="text-xs text-[#0f172a]/70">
                    <th className="border-b border-[#e5e7eb] py-2">Phase</th>
                    <th className="border-b border-[#e5e7eb] py-2">Dates</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-[#e5e7eb] py-2">Registrations Open</td>
                    <td className="border-b border-[#e5e7eb] py-2">Nov 1</td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] py-2">School Submissions</td>
                    <td className="border-b border-[#e5e7eb] py-2">Nov 1 - Dec 10</td>
                  </tr>
                  <tr>
                    <td className="border-b border-[#e5e7eb] py-2">Evaluation</td>
                    <td className="border-b border-[#e5e7eb] py-2">Dec 11 - Dec 25</td>
                  </tr>
                  <tr>
                    <td className="py-2">Results</td>
                    <td className="py-2">Dec 30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ goRegister }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Hero onRegister={goRegister} />
      {/* Imagery + About */}
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <FadeInSection className="rounded-2xl border border-[#f39c12]/50 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
          <div className="mb-2 text-lg font-semibold text-[#0f172a]">About the Initiative</div>
          <p className="text-sm text-[#0f172a]">VARNA is an initiative to nurture handwriting skills, creativity, and discipline among students through a structured, engaging competition.</p>
          <img alt="Students writing" className="mt-4 rounded-md w-full object-cover h-40" src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop" />
        </FadeInSection>
        <FadeInSection className="rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
          <div className="mb-2 text-lg font-semibold text-[#0f172a]">Participant Categories</div>
          <ul className="text-sm text-[#0f172a]">
            <li>Primary: Grades 1-4</li>
            <li>Middle: Grades 5-7</li>
            <li>High School: Grades 8-10</li>
          </ul>
          <img alt="Handwriting styles" className="mt-4 rounded-md w-full object-cover h-40" src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop" />
        </FadeInSection>
      </section>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#f39c12]/50 to-transparent" />

      {/* Awards with imagery */}
      <FadeInSection className="mt-6 rounded-2xl border border-[#f39c12]/50 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="mb-2 text-lg font-semibold text-[#0f172a]">Awards & Recognition</div>
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <p className="text-sm text-[#0f172a]">Certificates and accolades for winners at each level, with special recognition for schools demonstrating exceptional participation.</p>
          <img alt="Trophies" className="rounded-md w-full object-cover h-40" src="https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1200&auto=format&fit=crop" />
        </div>
      </FadeInSection>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#912920]/40 to-transparent" />

      {/* Why Handwriting Matters */}
      <FadeInSection className="mt-6 rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="mb-2 text-lg font-semibold text-[#0f172a]">Why Handwriting Matters</div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="mb-2 text-[#912920] font-semibold">Memory</div>
            <div className="text-sm text-[#0f172a]">Writing by hand improves retention and recall.</div>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <div className="mb-2 text-[#912920] font-semibold">Focus</div>
            <div className="text-sm text-[#0f172a]">Enhances concentration and attention to detail.</div>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <div className="mb-2 text-[#912920] font-semibold">Creativity</div>
            <div className="text-sm text-[#0f172a]">Fosters personal expression through penmanship.</div>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <div className="mb-2 text-[#912920] font-semibold">Discipline</div>
            <div className="text-sm text-[#0f172a]">Builds discipline and fine motor control.</div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#f39c12]/40 to-transparent" />

      {/* Impact Counter */}
      <FadeInSection className="mt-6 rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#0f172a]">Our Goal</div>
          <div className="mt-2 text-4xl font-extrabold text-[#912920]"><AnimatedCounter to={100000} />+ Students</div>
          <div className="mt-1 text-sm text-[#0f172a]">across Karnataka</div>
        </div>
      </FadeInSection>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#912920]/40 to-transparent" />

      {/* Collaborate list with icons (styled) */}
      <FadeInSection className="mt-6 rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="mb-2 text-lg font-semibold text-[#0f172a]">How to Collaborate</div>
        <ul className="text-sm text-[#0f172a] grid gap-3 sm:grid-cols-2">
          <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#f39c12]"></span> Schools: Encourage participation and host rounds.</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#f39c12]"></span> CSR Partners: Support logistics and prizes.</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#f39c12]"></span> NGOs & Departments: Coordinate outreach.</li>
          <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#f39c12]"></span> Media Partners: Amplify awareness.</li>
        </ul>
      </FadeInSection>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#f39c12]/40 to-transparent" />

      {/* FAQ */}
      <FadeInSection className="mt-6 rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="mb-4 text-lg font-semibold text-[#0f172a]">Frequently Asked Questions</div>
        <details className="border-b border-[#e5e7eb] py-3">
          <summary className="cursor-pointer text-[#0f172a] font-medium">Is there a registration fee?</summary>
          <p className="mt-2 text-sm text-[#0f172a]">No, participation is free.</p>
        </details>
        <details className="border-b border-[#e5e7eb] py-3">
          <summary className="cursor-pointer text-[#0f172a] font-medium">How will handwriting be judged?</summary>
          <p className="mt-2 text-sm text-[#0f172a]">Based on legibility, consistency, spacing, and adherence to style.</p>
        </details>
        <details className="py-3">
          <summary className="cursor-pointer text-[#0f172a] font-medium">When will E-Certificates be issued?</summary>
          <p className="mt-2 text-sm text-[#0f172a]">Within two weeks after results for each level.</p>
        </details>
      </FadeInSection>

      <FadeInSection className="my-6 h-[1px] bg-gradient-to-r from-transparent via-[#912920]/40 to-transparent" />

      {/* Testimonials */}
      <FadeInSection className="mt-6 rounded-2xl border border-white/40 p-6 bg-white/40 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
        <div className="mb-4 text-lg font-semibold text-[#0f172a]">What Educators Say</div>
        <div className="grid gap-4 md:grid-cols-2">
          <blockquote className="rounded-lg bg-gray-50 p-4 italic text-[#0f172a]">“VARNA reignites the joy of writing. Our students are more mindful and expressive.”
            <div className="mt-2 not-italic text-sm text-[#0f172a]/80">— Principal, Government High School</div>
          </blockquote>
          <blockquote className="rounded-lg bg-gray-50 p-4 italic text-[#0f172a]">“Handwriting practice has improved focus across subjects.”
            <div className="mt-2 not-italic text-sm text-[#0f172a]/80">— English Teacher, Bengaluru</div>
          </blockquote>
        </div>
      </FadeInSection>
    </main>
  );
}

function gradeToCategory(grade) {
  const g = parseInt(grade, 10);
  if (!g) return "";
  if (g >= 1 && g <= 4) return "Primary";
  if (g >= 5 && g <= 7) return "Middle";
  if (g >= 8 && g <= 10) return "High School";
  return "";
}

function RegisterIndividualPage() {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    category: "",
    style: "Cursive",
    schoolName: "",
    taluk: "",
    district: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", tone: "success" });

  useEffect(() => {
    setForm((f) => ({ ...f, category: gradeToCategory(f.grade) }));
  }, [form.grade]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        grade: form.grade ? parseInt(form.grade, 10) : undefined,
      };
      await apiFetch('/api/public/registrations/individual', { method: 'POST', body: payload });
      setModal({ open: true, title: "Submitted", message: "Your registration has been received.", tone: "success" });
      setForm({ studentName: "", grade: "", category: "", style: "Cursive", schoolName: "", taluk: "", district: "", parentName: "", parentEmail: "", parentPhone: "" });
    } catch (err) {
      setModal({ open: true, title: "Error", message: String(err?.message || err), tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-2xl font-semibold text-[#0f172a]">Register: Student</div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm text-[#0f172a]">Student Name</label>
          <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} required />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Grade (1-10)</label>
            <input type="number" min="1" max="10" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Category</label>
            <input className="rounded border border-[#e5e7eb] bg-gray-50 px-3 py-2 text-sm" value={form.category} readOnly />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Handwriting Style</label>
            <select className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
              <option>Cursive</option>
              <option>Split</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">School Name</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Taluk</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">District</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Parent Name</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Parent Email</label>
            <input type="email" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Parent Phone</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
          </div>
        </div>
        <div className="pt-2">
          <button disabled={loading} className="inline-flex items-center rounded-md bg-[#912920] px-4 py-2 text-sm font-medium text-white hover:bg-[#912920] active:bg-[#0f172a] disabled:opacity-60">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} message={modal.message} tone={modal.tone} />
    </main>
  );
}

function RegisterSchoolPage() {
  const [form, setForm] = useState({
    orgName: "",
    coordName: "",
    coordEmail: "",
    coordPhone: "",
    taluk: "",
    district: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", tone: "success" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setModal({ open: true, title: "File required", message: "Please upload the participant list file.", tone: "error" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('participantSheet', file);
      await apiFetch('/api/public/registrations/school', { method: 'POST', body: fd, isFormData: true });
      setModal({ open: true, title: "Submitted", message: "School registration sheet uploaded successfully.", tone: "success" });
      setForm({ orgName: "", coordName: "", coordEmail: "", coordPhone: "", taluk: "", district: "" });
      setFile(null);
    } catch (err) {
      setModal({ open: true, title: "Error", message: String(err?.message || err), tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-2xl font-semibold text-[#0f172a]">Register: School</div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm text-[#0f172a]">School/Organization Name</label>
          <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} required />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Coordinator Name</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.coordName} onChange={(e) => setForm({ ...form, coordName: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Coordinator Email</label>
            <input type="email" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.coordEmail} onChange={(e) => setForm({ ...form, coordEmail: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Coordinator Phone</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.coordPhone} onChange={(e) => setForm({ ...form, coordPhone: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Taluk</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.taluk} onChange={(e) => setForm({ ...form, taluk: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">District</label>
            <input className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-[#0f172a]">Participant Sheet (.xls/.xlsx/.csv)</label>
            <input type="file" accept=".xls,.xlsx,.csv" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </div>
        </div>
        <div className="pt-2">
          <button disabled={loading} className="inline-flex items-center rounded-md bg-[#912920] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} message={modal.message} tone={modal.tone} />
    </main>
  );
}

function AdminLoginPage({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await apiFetch("/api/admin/login", { method: "POST", body: { email, password } });
      localStorage.setItem("varna_admin_token", resp.token);
      localStorage.setItem("varna_admin_email", resp.email);
      onSuccess(resp);
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 text-2xl font-semibold text-[#0f172a]">Admin Login</div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm text-[#0f172a]">Email</label>
          <input type="email" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm text-[#0f172a]">Password</label>
          <input type="password" className="rounded border border-[#e5e7eb] px-3 py-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <div className="text-sm text-red-700">{error}</div> : null}
        <div className="pt-2">
          <button disabled={loading} className="rounded-md bg-[#912920] px-4 py-2 text-sm font-medium text-white hover:bg-[#912920] active:bg-[#0f172a] disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </div>
      </form>
    </main>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-auto rounded border border-[#e5e7eb]">
      <table className="min-w-[800px] w-full text-left text-sm text-[#0f172a]">
        <thead className="bg-gray-50 text-xs text-[#0f172a]/70">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="border-b border-[#e5e7eb] px-3 py-2">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="border-b border-[#e5e7eb] px-3 py-2">
                  {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-[#0f172a]/70">No records</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function AdminPanelPage({ token, email, onLogout }) {
  const [tab, setTab] = useState("individual");
  const [indRows, setIndRows] = useState([]);
  const [schRows, setSchRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const [ind, sch] = await Promise.all([
          apiFetch("/api/admin/registrations/individual", { token }),
          apiFetch("/api/admin/registrations/school", { token }),
        ]);
        if (!cancelled) {
          setIndRows(ind || []);
          setSchRows(sch || []);
        }
      } catch (e) {
        // ignore here; surface via UI optionally
      }
    }
    loadAll();
    const id = setInterval(loadAll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  const indCols = useMemo(
    () => [
      { key: "studentName", label: "Student" },
      { key: "grade", label: "Grade" },
      { key: "category", label: "Category" },
      { key: "style", label: "Style" },
      { key: "schoolName", label: "School" },
      { key: "taluk", label: "Taluk" },
      { key: "district", label: "District" },
      { key: "parentName", label: "Parent" },
      { key: "parentEmail", label: "Email" },
      { key: "parentPhone", label: "Phone" },
    ],
    []
  );

  const schCols = useMemo(
    () => [
      { key: "orgName", label: "School/Org" },
      { key: "coordName", label: "Coordinator" },
      { key: "coordEmail", label: "Email" },
      { key: "coordPhone", label: "Phone" },
      { key: "taluk", label: "Taluk" },
      { key: "district", label: "District" },
      { key: "downloadURL", label: "Participant Sheet", render: (v) => (
        v ? (
          <a href={v} target="_blank" rel="noreferrer" className="text-[#912920] underline">Open</a>
        ) : ""
      ) },
    ],
    []
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-2xl font-semibold text-[#0f172a]">Admin Panel</div>
        <div className="flex items-center gap-3">
          <div className="rounded bg-gray-100 px-3 py-1 text-sm text-[#0f172a]">{email}</div>
          <button onClick={onLogout} className="rounded-md bg-[#912920] px-3 py-2 text-sm font-medium text-white hover:bg-[#912920] active:bg-[#0f172a]">Logout</button>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab("individual")} className={`rounded px-3 py-2 text-sm ${tab === "individual" ? "bg-[#912920] text-white active:bg-[#0f172a]" : "bg-gray-100 text-[#0f172a]"}`}>Individual Registrations</button>
        <button onClick={() => setTab("school")} className={`rounded px-3 py-2 text-sm ${tab === "school" ? "bg-[#912920] text-white active:bg-[#0f172a]" : "bg-gray-100 text-[#0f172a]"}`}>School Registrations</button>
      </div>
      {tab === "individual" ? (
        <DataTable columns={indCols} rows={indRows} />
      ) : (
        <DataTable columns={schCols} rows={schRows} />
      )}
    </main>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const vantaRef = useRef(null);
  const vantaInstance = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem("varna_admin_token") || "";
    const em = localStorage.getItem("varna_admin_email") || "";
    setToken(t);
    setAdminEmail(em);
  }, []);

  useEffect(() => {
    let mounted = true;
    function initVanta() {
      if (!mounted) return;
      if (vantaInstance.current || !window.VANTA || !window.THREE || !vantaRef.current) return;
      try {
        vantaInstance.current = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xd9ccd2,
          color2: 0x9f9898,
          size: 1.2,
          backgroundColor: 0x50506d,
        });
      } catch (e) {
        // ignore
      }
    }
    const readyInterval = setInterval(() => {
      if (window.VANTA && window.THREE) {
        clearInterval(readyInterval);
        initVanta();
      }
    }, 200);
    return () => {
      mounted = false;
      clearInterval(readyInterval);
      if (vantaInstance.current) {
        try { vantaInstance.current.destroy(); } catch {}
        vantaInstance.current = null;
      }
    };
  }, []);

  function requireAdmin(pageIfAuthed) {
    if (token) return setPage(pageIfAuthed);
    setPage("admin-login");
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0f172a]">
      <Header page={page} setPage={setPage} user={token ? { isAnonymous: false } : null} />
      <div className="relative">
        <div ref={vantaRef} id="vanta-globe" className="pointer-events-none absolute inset-0 -z-10"></div>
        <div className="relative z-10">
          {page === "home" ? (
            <HomePage goRegister={setPage} />
          ) : null}
          {page === "register-individual" ? (
            <RegisterIndividualPage />
          ) : null}
          {page === "register-school" ? (
            <RegisterSchoolPage />
          ) : null}
          {page === "admin-login" ? (
            <AdminLoginPage onSuccess={(resp) => { setToken(resp.token); setAdminEmail(resp.email); setPage("admin-panel"); }} />
          ) : null}
          {page === "admin-panel" ? (
            token ? (
              <AdminPanelPage token={token} email={adminEmail} onLogout={() => { localStorage.removeItem("varna_admin_token"); localStorage.removeItem("varna_admin_email"); setToken(""); setAdminEmail(""); setPage("home"); }} />
            ) : (
              requireAdmin("admin-panel"), null
            )
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const mount = document.getElementById("root");
if (mount) {
  const root = createRoot(mount);
  root.render(<App />);
}
