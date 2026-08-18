import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Save,
  Plus,
  Trash2,
  Edit3,
  Home,
  CheckCircle,
  FileText,
  Upload,
  Link2,
  Layers,
  Briefcase,
  FolderGit2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sliders,
  X,
} from "lucide-react";
import DynamicIcon from "../components/DynamicIcon";

const PRESET_ICONS = [
  "Code2",
  "Database",
  "Cpu",
  "Layers",
  "Smartphone",
  "Globe",
  "Server",
  "Terminal",
  "ShieldCheck",
  "Sparkles",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");

  // 1. Profile State
  const [profile, setProfile] = useState({
    name: "",
    roleTag: "",
    headline: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    avatarUrl: "",
  });

  // 2. Sections Order & Visibility State
  const [sectionOrder, setSectionOrder] = useState([
    { id: "projects", label: "Featured Projects", visible: true },
    { id: "experience", label: "Work Experience", visible: true },
    { id: "contact", label: "Contact Section", visible: true },
  ]);

  // 3. Highlights State
  const [highlights, setHighlights] = useState([]);
  const [highlightForm, setHighlightForm] = useState({
    subtitle: "",
    title: "",
    iconType: "preset",
    icon: "Code2",
  });
  const [editingHighlightId, setEditingHighlightId] = useState(null);

  // 4. Projects State
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "",
    description: "",
    tags: "",
    githubUrl: "",
    liveUrl: "",
  });
  const [editingProjectId, setEditingProjectId] = useState(null);

  // 5. Experience State
  const [experiences, setExperiences] = useState([]);
  const [expForm, setExpForm] = useState({
    role: "",
    company: "",
    period: "",
    location: "",
    description: "",
    skills: "",
  });
  const [editingExpId, setEditingExpId] = useState(null);

  // 6. CV State
  const [resumes, setResumes] = useState([]);
  const [cvInputMode, setCvInputMode] = useState("upload");
  const [cvTitle, setCvTitle] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvBase64File, setCvBase64File] = useState("");
  const [fileNameDisplay, setFileNameDisplay] = useState("");

  useEffect(() => {
    // 1. Load Profile & Section Arrangement
    async function loadConfig() {
      const snap = await getDoc(doc(db, "content", "profile"));
      if (snap.exists()) setProfile(snap.data());

      const secSnap = await getDoc(doc(db, "content", "sections"));
      if (secSnap.exists() && Array.isArray(secSnap.data().order)) {
        setSectionOrder(secSnap.data().order);
      }
    }
    loadConfig();

    // 2. Real-time highlights sync with strict numeric ordering
    const unsubHighlights = onSnapshot(collection(db, "highlights"), (snap) => {
      const list = snap.docs.map((d, index) => ({
        id: d.id,
        order: d.data().order !== undefined ? Number(d.data().order) : index,
        ...d.data(),
      }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setHighlights(list);
    });

    // 3. Real-time projects sync
    const unsubProjects = onSnapshot(collection(db, "projects"), (snap) => {
      const list = snap.docs.map((d, index) => ({
        id: d.id,
        order: d.data().order !== undefined ? Number(d.data().order) : index,
        ...d.data(),
      }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setProjects(list);
    });

    // 4. Real-time experiences sync
    const unsubExperiences = onSnapshot(
      collection(db, "experiences"),
      (snap) => {
        const list = snap.docs.map((d, index) => ({
          id: d.id,
          order: d.data().order !== undefined ? Number(d.data().order) : index,
          ...d.data(),
        }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setExperiences(list);
      },
    );

    // 5. Real-time CVs sync
    const unsubResumes = onSnapshot(collection(db, "resumes"), (snap) =>
      setResumes(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );

    return () => {
      unsubHighlights();
      unsubProjects();
      unsubExperiences();
      unsubResumes();
    };
  }, []);

  // --- REORDERING LOGIC: Re-indexes all items to sequential order (0, 1, 2, ...) ---
  const handleMoveItem = async (collectionName, list, index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // 1. Clone list and swap positions
    const reordered = [...list];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // 2. Optimistic UI update
    if (collectionName === "highlights") setHighlights(reordered);
    if (collectionName === "projects") setProjects(reordered);
    if (collectionName === "experiences") setExperiences(reordered);

    // 3. Persist new indices directly to Firestore
    try {
      await Promise.all(
        reordered.map((item, i) =>
          updateDoc(doc(db, collectionName, item.id), { order: i }),
        ),
      );
      showFeedback("Display arrangement updated!");
    } catch (err) {
      showFeedback("Error saving order: " + err.message);
    }
  };

  // --- SECTIONS REORDERING & VISIBILITY ---
  const handleMoveSection = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const newSections = [...sectionOrder];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    setSectionOrder(newSections);
    await setDoc(
      doc(db, "content", "sections"),
      { order: newSections },
      { merge: true },
    );
    showFeedback("Section order saved!");
  };

  const handleToggleSectionVisibility = async (index) => {
    const newSections = [...sectionOrder];
    newSections[index].visible = !newSections[index].visible;
    setSectionOrder(newSections);
    await setDoc(
      doc(db, "content", "sections"),
      { order: newSections },
      { merge: true },
    );
    showFeedback("Section visibility updated!");
  };

  // --- HIGHLIGHTS CRUD ---
  const handleCustomIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setHighlightForm((prev) => ({ ...prev, icon: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHighlight = async (e) => {
    e.preventDefault();
    const payload = {
      subtitle: highlightForm.subtitle,
      title: highlightForm.title,
      icon: highlightForm.icon || "Code2",
      order: editingHighlightId
        ? (highlights.find((h) => h.id === editingHighlightId)?.order ??
          highlights.length)
        : highlights.length,
    };

    if (editingHighlightId) {
      await updateDoc(doc(db, "highlights", editingHighlightId), payload);
      showFeedback("Highlight updated!");
    } else {
      await addDoc(collection(db, "highlights"), payload);
      showFeedback("Highlight added!");
    }
    setEditingHighlightId(null);
    setHighlightForm({
      subtitle: "",
      title: "",
      iconType: "preset",
      icon: "Code2",
    });
  };

  const handleDeleteHighlight = async (id) => {
    if (window.confirm("Delete highlight?")) {
      await deleteDoc(doc(db, "highlights", id));
      showFeedback("Highlight removed.");
    }
  };

  // --- PROJECTS CRUD ---
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const payload = {
      title: projectForm.title,
      category: projectForm.category,
      description: projectForm.description,
      tags:
        typeof projectForm.tags === "string"
          ? projectForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : projectForm.tags,
      githubUrl: projectForm.githubUrl,
      liveUrl: projectForm.liveUrl,
      order: editingProjectId
        ? (projects.find((p) => p.id === editingProjectId)?.order ??
          projects.length)
        : projects.length,
    };

    if (editingProjectId) {
      await updateDoc(doc(db, "projects", editingProjectId), payload);
      showFeedback("Project updated!");
    } else {
      await addDoc(collection(db, "projects"), payload);
      showFeedback("Project added!");
    }
    setEditingProjectId(null);
    setProjectForm({
      title: "",
      category: "",
      description: "",
      tags: "",
      githubUrl: "",
      liveUrl: "",
    });
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Delete project?")) {
      await deleteDoc(doc(db, "projects", id));
      showFeedback("Project removed.");
    }
  };

  // --- EXPERIENCE CRUD ---
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const payload = {
      role: expForm.role,
      company: expForm.company,
      period: expForm.period,
      location: expForm.location,
      description: expForm.description,
      skills:
        typeof expForm.skills === "string"
          ? expForm.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : expForm.skills,
      order: editingExpId
        ? (experiences.find((x) => x.id === editingExpId)?.order ??
          experiences.length)
        : experiences.length,
    };

    if (editingExpId) {
      await updateDoc(doc(db, "experiences", editingExpId), payload);
      showFeedback("Experience updated!");
    } else {
      await addDoc(collection(db, "experiences"), payload);
      showFeedback("Experience added!");
    }
    setEditingExpId(null);
    setExpForm({
      role: "",
      company: "",
      period: "",
      location: "",
      description: "",
      skills: "",
    });
  };

  const handleDeleteExp = async (id) => {
    if (window.confirm("Delete experience?")) {
      await deleteDoc(doc(db, "experiences", id));
      showFeedback("Experience removed.");
    }
  };

  // --- CV CRUD ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileNameDisplay(file.name);
      if (!cvTitle) setCvTitle(file.name.replace(".pdf", ""));
      const reader = new FileReader();
      reader.onloadend = () => setCvBase64File(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddResume = async (e) => {
    e.preventDefault();
    const finalUrl = cvInputMode === "upload" ? cvBase64File : cvUrl;
    if (!cvTitle || !finalUrl) return;

    await addDoc(collection(db, "resumes"), {
      title: cvTitle,
      fileUrl: finalUrl,
      type: cvInputMode,
      isActive: resumes.length === 0,
      createdAt: new Date().toISOString(),
    });
    setCvTitle("");
    setCvUrl("");
    setCvBase64File("");
    setFileNameDisplay("");
    showFeedback("CV uploaded!");
  };

  const handleSetActiveResume = async (id) => {
    for (const r of resumes) {
      await updateDoc(doc(db, "resumes", r.id), { isActive: r.id === id });
    }
    showFeedback("Active CV updated!");
  };

  const handleDeleteResume = async (id) => {
    if (window.confirm("Delete this CV?")) {
      await deleteDoc(doc(db, "resumes", id));
      showFeedback("CV deleted.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "content", "profile"), profile);
    showFeedback("Profile updated!");
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  return (
    <div className="min-h-screen bg-surface text-slate-200 p-6 md:p-12 space-y-12 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cardBorder pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Portfolio Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Manage display arrangements, sections order, bio & projects
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-card border border-cardBorder hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> View Public Site
          </button>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-lg bg-brand/10 border border-brand/20 text-brand text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {feedback}
        </div>
      )}

      {/* 1. PROFILE DETAILS */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-brand" /> Edit Profile
        </h2>
        <form
          onSubmit={handleUpdateProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={profile.roleTag}
            onChange={(e) =>
              setProfile({ ...profile, roleTag: e.target.value })
            }
            placeholder="Role Tag"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={profile.headline}
            onChange={(e) =>
              setProfile({ ...profile, headline: e.target.value })
            }
            placeholder="Headline"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <textarea
            rows="2"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Bio"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <button
            type="submit"
            className="md:col-span-2 py-2 bg-brand text-slate-950 font-bold text-xs rounded-lg"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* 2. CV / RESUME MANAGER */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand" /> Manage CV / Resume
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCvInputMode("upload")}
            className={`px-3 py-1 text-xs font-bold rounded ${
              cvInputMode === "upload"
                ? "bg-brand text-slate-950"
                : "bg-surface text-slate-400"
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setCvInputMode("url")}
            className={`px-3 py-1 text-xs font-bold rounded ${
              cvInputMode === "url"
                ? "bg-brand text-slate-950"
                : "bg-surface text-slate-400"
            }`}
          >
            Direct URL
          </button>
        </div>
        <form
          onSubmit={handleAddResume}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-5">
            <input
              type="text"
              required
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              placeholder="CV Title"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
            />
          </div>
          <div className="md:col-span-5">
            {cvInputMode === "upload" ? (
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-dashed border-slate-700 cursor-pointer text-xs text-slate-300">
                <Upload className="w-3.5 h-3.5 text-brand" />{" "}
                {fileNameDisplay || "Select PDF file"}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <input
                type="text"
                required
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="PDF Link (https://...)"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
              />
            )}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-brand text-slate-950 font-bold text-xs"
            >
              Add CV
            </button>
          </div>
        </form>
        <div className="divide-y divide-cardBorder pt-2">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <span className="font-semibold text-white">{r.title}</span>
              <div className="flex items-center gap-2">
                {r.isActive ? (
                  <span className="text-emerald-400 font-bold">Active</span>
                ) : (
                  <button
                    onClick={() => handleSetActiveResume(r.id)}
                    className="bg-slate-800 px-2 py-1 rounded text-slate-300"
                  >
                    Set Active
                  </button>
                )}
                <button
                  onClick={() => handleDeleteResume(r.id)}
                  className="text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTIONS ORDER & VISIBILITY */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-brand" /> Page Sections Order &
          Visibility
        </h2>
        <p className="text-xs text-slate-400">
          Reorder or hide entire sections on the public landing page.
        </p>

        <div className="space-y-2 pt-2">
          {sectionOrder.map((sec, idx) => (
            <div
              key={sec.id}
              className="p-3.5 rounded-xl bg-surface border border-cardBorder flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    sec.visible ? "text-white" : "text-slate-500 line-through"
                  }`}
                >
                  {sec.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSectionVisibility(idx)}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                    sec.visible
                      ? "bg-slate-800 text-emerald-400"
                      : "bg-slate-800 text-slate-500"
                  }`}
                  title="Toggle Visibility"
                >
                  {sec.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveSection(idx, -1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sectionOrder.length - 1}
                  onClick={() => handleMoveSection(idx, 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SKILL HIGHLIGHT PILLARS & REORDERING */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand" /> Manage & Reorder Highlight
            Pillars
          </h2>
          {editingHighlightId && (
            <button
              onClick={() => {
                setEditingHighlightId(null);
                setHighlightForm({
                  subtitle: "",
                  title: "",
                  iconType: "preset",
                  icon: "Code2",
                });
              }}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSaveHighlight} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={highlightForm.subtitle}
              onChange={(e) =>
                setHighlightForm({ ...highlightForm, subtitle: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
              placeholder="Subtitle (e.g. Web & Mobile)"
            />
            <input
              type="text"
              required
              value={highlightForm.title}
              onChange={(e) =>
                setHighlightForm({ ...highlightForm, title: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
              placeholder="Title (e.g. React Native / React.js)"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setHighlightForm({ ...highlightForm, iconType: "preset" })
              }
              className={`px-3 py-1 rounded text-xs font-bold ${
                highlightForm.iconType === "preset"
                  ? "bg-brand text-slate-950"
                  : "bg-surface text-slate-400"
              }`}
            >
              Preset Icon
            </button>
            <button
              type="button"
              onClick={() =>
                setHighlightForm({ ...highlightForm, iconType: "upload" })
              }
              className={`px-3 py-1 rounded text-xs font-bold ${
                highlightForm.iconType === "upload"
                  ? "bg-brand text-slate-950"
                  : "bg-surface text-slate-400"
              }`}
            >
              Upload Custom SVG/PNG
            </button>
          </div>
          {highlightForm.iconType === "preset" ? (
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setHighlightForm({ ...highlightForm, icon: i })
                  }
                  className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 ${
                    highlightForm.icon === i
                      ? "border-brand bg-brand/10"
                      : "border-cardBorder"
                  }`}
                >
                  <DynamicIcon icon={i} className="w-3.5 h-3.5" /> {i}
                </button>
              ))}
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-dashed border-slate-700 cursor-pointer text-xs">
              <Upload className="w-3.5 h-3.5 text-brand" /> Upload Icon File
              <input
                type="file"
                accept="image/svg+xml,image/png"
                onChange={handleCustomIconUpload}
                className="hidden"
              />
            </label>
          )}
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-brand text-slate-950 font-bold text-xs"
          >
            {editingHighlightId ? "Update Highlight" : "Add Highlight Pillar"}
          </button>
        </form>

        {/* Existing Highlight Pillars with Reorder Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {highlights.map((item, idx) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-surface border border-cardBorder flex flex-col justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-brand text-[10px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="p-1.5 rounded-lg bg-brand/10 text-brand flex-shrink-0">
                  <DynamicIcon icon={item.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 truncate">
                    {item.subtitle}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {item.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-cardBorder/60 pt-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() =>
                      handleMoveItem("highlights", highlights, idx, -1)
                    }
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-bold transition"
                    title="Move Left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={idx === highlights.length - 1}
                    onClick={() =>
                      handleMoveItem("highlights", highlights, idx, 1)
                    }
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-bold transition"
                    title="Move Right"
                  >
                    →
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHighlightId(item.id);
                      setHighlightForm({
                        subtitle: item.subtitle,
                        title: item.title,
                        iconType: "preset",
                        icon: item.icon,
                      });
                    }}
                    className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHighlight(item.id)}
                    className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FEATURED PROJECTS & REORDERING */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-brand" /> Manage & Reorder
            Featured Projects
          </h2>
          {editingProjectId && (
            <button
              onClick={() => {
                setEditingProjectId(null);
                setProjectForm({
                  title: "",
                  category: "",
                  description: "",
                  tags: "",
                  githubUrl: "",
                  liveUrl: "",
                });
              }}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSaveProject}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            required
            value={projectForm.title}
            onChange={(e) =>
              setProjectForm({ ...projectForm, title: e.target.value })
            }
            placeholder="Project Title"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            required
            value={projectForm.category}
            onChange={(e) =>
              setProjectForm({ ...projectForm, category: e.target.value })
            }
            placeholder="Category (e.g. Cloud POS & Staging)"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <textarea
            rows="2"
            required
            value={projectForm.description}
            onChange={(e) =>
              setProjectForm({ ...projectForm, description: e.target.value })
            }
            placeholder="Description"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={projectForm.tags}
            onChange={(e) =>
              setProjectForm({ ...projectForm, tags: e.target.value })
            }
            placeholder="Tags (Comma Separated)"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="url"
            value={projectForm.githubUrl}
            onChange={(e) =>
              setProjectForm({ ...projectForm, githubUrl: e.target.value })
            }
            placeholder="GitHub URL"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="url"
            value={projectForm.liveUrl}
            onChange={(e) =>
              setProjectForm({ ...projectForm, liveUrl: e.target.value })
            }
            placeholder="Live URL (Optional)"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <button
            type="submit"
            className="md:col-span-2 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg"
          >
            {editingProjectId ? "Update Project" : "Save Project"}
          </button>
        </form>

        <div className="divide-y divide-cardBorder pt-2">
          {projects.map((p, idx) => (
            <div
              key={p.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-brand text-[10px] font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {p.title}
                  </h4>
                  <p className="text-xs text-brand">{p.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveItem("projects", projects, idx, -1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === projects.length - 1}
                  onClick={() => handleMoveItem("projects", projects, idx, 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProjectId(p.id);
                    setProjectForm({
                      title: p.title || "",
                      category: p.category || "",
                      description: p.description || "",
                      tags: Array.isArray(p.tags)
                        ? p.tags.join(", ")
                        : p.tags || "",
                      githubUrl: p.githubUrl || "",
                      liveUrl: p.liveUrl || "",
                    });
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(p.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. WORK EXPERIENCE & REORDERING */}
      <div className="p-6 md:p-8 rounded-2xl bg-card border border-cardBorder space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand" /> Manage & Reorder Work
            Experience
          </h2>
          {editingExpId && (
            <button
              onClick={() => {
                setEditingExpId(null);
                setExpForm({
                  role: "",
                  company: "",
                  period: "",
                  location: "",
                  description: "",
                  skills: "",
                });
              }}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSaveExperience}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            required
            value={expForm.role}
            onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
            placeholder="Role (e.g. Software Developer Intern)"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            required
            value={expForm.company}
            onChange={(e) =>
              setExpForm({ ...expForm, company: e.target.value })
            }
            placeholder="Company / Org"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={expForm.period}
            onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
            placeholder="Period (e.g. 2026)"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={expForm.location}
            onChange={(e) =>
              setExpForm({ ...expForm, location: e.target.value })
            }
            placeholder="Location (e.g. Cebu, PH)"
            className="px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <textarea
            rows="2"
            required
            value={expForm.description}
            onChange={(e) =>
              setExpForm({ ...expForm, description: e.target.value })
            }
            placeholder="Description"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <input
            type="text"
            value={expForm.skills}
            onChange={(e) => setExpForm({ ...expForm, skills: e.target.value })}
            placeholder="Skills (Comma Separated)"
            className="md:col-span-2 px-3 py-2 rounded-lg bg-surface border border-cardBorder text-xs text-white"
          />
          <button
            type="submit"
            className="md:col-span-2 py-2 bg-brand text-slate-950 font-bold text-xs rounded-lg"
          >
            {editingExpId ? "Update Experience" : "Add Experience"}
          </button>
        </form>

        <div className="divide-y divide-cardBorder pt-2">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-brand text-[10px] font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-sm font-bold text-white">{exp.role}</div>
                  <div className="text-xs text-brand font-medium">
                    {exp.company} • {exp.period}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() =>
                    handleMoveItem("experiences", experiences, idx, -1)
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === experiences.length - 1}
                  onClick={() =>
                    handleMoveItem("experiences", experiences, idx, 1)
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExpId(exp.id);
                    setExpForm({
                      role: exp.role || "",
                      company: exp.company || "",
                      period: exp.period || "",
                      location: exp.location || "",
                      description: exp.description || "",
                      skills: Array.isArray(exp.skills)
                        ? exp.skills.join(", ")
                        : exp.skills || "",
                    });
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteExp(exp.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
