"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Bookmark, Check, ChevronRight, ExternalLink, LockKeyhole, Save, Search, Send, Share2 } from "lucide-react";
import { articles, categories, courses, representatives } from "@/lib/content";

type RequestState = { busy: boolean; message: string; error: boolean };
const emptyState: RequestState = { busy: false, message: "", error: false };
async function sendApi(path: string, body?: unknown, method = "POST") {
  return fetch(path, { method, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", "x-civic-link": "1" }, body: body ? JSON.stringify(body) : undefined });
}

export function NewsBrowser() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("All");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    const requestedCategory = params.get("category");
    if (query) setTerm(query.slice(0, 100));
    if (requestedCategory && categories.includes(requestedCategory)) setCategory(requestedCategory);
  }, []);
  const filtered = articles.filter((article) => (category === "All" || article.category.toLowerCase() === category.toLowerCase()) && `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(term.toLowerCase()));
  return <>
    <div className="filter-bar"><label className="filter-search"><Search size={17} /><span className="sr-only">Search demo stories</span><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search the sample desk" /></label><div className="filter-chips" aria-label="Filter stories by category">{categories.map((item) => <button type="button" key={item} className={category === item ? "filter-chip active" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
    {filtered.length ? <div className="news-grid">{filtered.map((article, index) => <article className="news-card" key={article.slug}><div className={`card-top-visual visual-${index % 4}`}><span className="demo-pill">SAMPLE</span><span className="visual-index">0{index + 1}</span></div><div className="news-card-body"><span className="story-category">{article.category} <span>·</span> {article.kind}</span><h2><Link href={`/news/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><div className="card-meta"><span>{article.publishedAt} · {article.source}</span><span>{article.readTime}</span></div><div className="card-actions"><Link className="text-link" href={`/news/${article.slug}`}>Read story <ArrowRight size={15} /></Link><div className="card-action-group"><ShareButton title={article.title} url={`/news/${article.slug}`} /><SaveArticleButton slug={article.slug} /></div></div></div></article>)}</div> : <div className="empty-state"><Search size={22} /><h3>No sample stories match that search</h3><p>Try a different word or select another topic.</p></div>}
  </>;
}

export function SaveArticleButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    fetch("/api/saved", { credentials: "same-origin", cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((data) => { if (live && data) setSaved(data.saved.includes(slug)); }).catch(() => {});
    return () => { live = false; };
  }, [slug]);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await sendApi("/api/saved", { slug, saved: !saved });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setSaved(Boolean(data.saved));
      else setMessage(response.status === 401 ? "Sign in to save this story." : data.error || "Could not save this story.");
    } catch { setMessage("Could not save this story right now."); }
    finally { setBusy(false); }
  }
  return <span className="save-action-wrap"><button className="icon-action" onClick={toggle} disabled={busy} aria-label={saved ? "Remove saved story" : "Save story"} aria-pressed={saved}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{busy ? "Saving…" : saved ? "Saved" : "Save"}</button>{message && <span className="inline-hint">{message} {message.startsWith("Sign in") && <Link href="/sign-in">Sign in</Link>}</span>}</span>;
}

export function ShareButton({ title, url }: { title: string; url?: string }) {
  const [message, setMessage] = useState("");
  async function share() {
    try {
      const shareUrl = url ? new URL(url, window.location.origin).toString() : window.location.href;
      if (navigator.share) await navigator.share({ title, url: shareUrl });
      else { await navigator.clipboard.writeText(shareUrl); setMessage("Link copied"); }
    } catch { setMessage("Sharing cancelled"); }
    window.setTimeout(() => setMessage(""), 2200);
  }
  return <span className="save-action-wrap"><button className="icon-action" onClick={share}><Share2 size={16} />Share</button>{message && <span className="inline-hint">{message}</span>}</span>;
}

export function SignInButton({ label = "Continue with Manus" }: { label?: string }) {
  const [state, setState] = useState(emptyState);
  async function start() {
    setState({ busy: true, message: "Connecting to secure sign-in…", error: false });
    try {
      const response = await sendApi("/api/auth/start");
      const data = await response.json();
      if (!response.ok || !data.authorizationUrl) throw new Error(data.error || "Sign-in is not available right now.");
      window.location.assign(data.authorizationUrl);
    } catch (error) {
      setState({ busy: false, message: error instanceof Error ? error.message : "Sign-in could not start.", error: true });
    }
  }
  return <div className="auth-action"><button className="button button-navy button-wide" type="button" onClick={start} disabled={state.busy}><LockKeyhole size={17} />{state.busy ? "Please wait…" : label}<ArrowRight size={16} /></button>{state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}</p>}</div>;
}

export function SignOutButton() {
  const [message, setMessage] = useState("");
  async function logout() {
    const response = await sendApi("/api/auth/logout");
    if (response.ok) window.location.assign("/");
    else setMessage("Sign-out could not be completed.");
  }
  return <div><button className="button button-outline" onClick={logout}>Sign out</button>{message && <p className="form-message error">{message}</p>}</div>;
}

export function CourseProgressButton({ slug }: { slug: string }) {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState(emptyState);
  useEffect(() => {
    let live = true;
    fetch("/api/progress", { credentials: "same-origin", cache: "no-store" }).then(async (response) => response.ok ? response.json() : null).then((data) => {
      const current = data?.progress?.find((item: { courseSlug: string; progressPercent: number }) => item.courseSlug === slug);
      if (live && current) setProgress(current.progressPercent);
    }).catch(() => {});
    return () => { live = false; };
  }, [slug]);
  async function markComplete() {
    setState({ busy: true, message: "Saving progress…", error: false });
    const next = progress === 0 ? 33 : progress === 33 ? 66 : 100;
    try {
      const response = await sendApi("/api/progress", { courseSlug: slug, progressPercent: next });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to save your learning progress." : data.error || "Could not save progress.");
      setProgress(next);
      setState({ busy: false, message: next === 100 ? "Course marked complete." : `Progress saved: ${next}%.`, error: false });
    } catch (error) { setState({ busy: false, message: error instanceof Error ? error.message : "Could not save progress.", error: true }); }
  }
  return <div className="progress-control"><button className="button button-gold" onClick={markComplete} disabled={state.busy || progress === 100}><Check size={16} />{progress === 100 ? "Completed" : state.busy ? "Saving…" : "Mark a lesson complete"}</button>{state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}{state.error && state.message.startsWith("Sign in") && <> <Link href="/sign-in">Sign in</Link></>}</p>}</div>;
}

export function ConcernForm() {
  const [state, setState] = useState(emptyState);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ busy: true, message: "Sending your private concern…", error: false });
    try {
      const response = await sendApi("/api/concerns", { subject: form.get("subject"), description: form.get("description"), generalArea: form.get("generalArea") });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to submit and track a private concern." : data.error || "Could not submit the concern.");
      event.currentTarget.reset();
      setState({ busy: false, message: data.message, error: false });
    } catch (error) { setState({ busy: false, message: error instanceof Error ? error.message : "Could not submit the concern.", error: true }); }
  }
  return <form className="form-card" onSubmit={submit}>
    <div className="form-heading"><span className="form-icon"><Send size={17} /></span><div><h3>Submit a community concern</h3><p>Your submission is private to your account and authorized staff.</p></div></div>
    <label>Subject<input name="subject" minLength={8} maxLength={180} required placeholder="Summarize the public issue" /></label>
    <label>General area <span className="optional">Optional</span><input name="generalArea" maxLength={120} placeholder="District or general area — no home address" /></label>
    <label>What would you like the relevant office to know?<textarea name="description" minLength={25} maxLength={4000} required rows={5} placeholder="Describe the issue and what information or action you are requesting." /></label>
    <p className="form-note"><LockKeyhole size={14} /> Do not include identity documents, private phone numbers or sensitive allegations. Submitting does not guarantee an official response.</p>
    <button className="button button-navy" disabled={state.busy}>{state.busy ? "Sending…" : "Submit privately"}<ArrowRight size={16} /></button>
    {state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}{state.error && state.message.startsWith("Sign in") && <> <Link href="/sign-in">Sign in</Link></>}</p>}
  </form>;
}

export function QuestionForm({ representativeSlug }: { representativeSlug: string }) {
  const [state, setState] = useState(emptyState);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ busy: true, message: "Sending question…", error: false });
    try {
      const response = await sendApi("/api/questions", { representativeSlug, question: form.get("question") });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to submit a question." : data.error || "Could not submit your question.");
      event.currentTarget.reset();
      setState({ busy: false, message: data.notice || "Question submitted.", error: false });
    } catch (error) { setState({ busy: false, message: error instanceof Error ? error.message : "Could not submit your question.", error: true }); }
  }
  return <form className="form-card compact-form" onSubmit={submit}><div className="form-heading"><span className="form-icon"><Send size={17} /></span><div><h3>Ask a public question</h3><p>This example profile is not a real public representative.</p></div></div><label>Your question<textarea name="question" minLength={10} maxLength={2400} required rows={4} placeholder="Ask a clear, constructive question" /></label><button className="button button-navy" disabled={state.busy}>{state.busy ? "Sending…" : "Submit question"}<ArrowRight size={16} /></button>{state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}{state.error && state.message.startsWith("Sign in") && <> <Link href="/sign-in">Sign in</Link></>}</p>}</form>;
}

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string | null; roles: string[] } | null>(null);
  const [profile, setProfile] = useState({ displayName: "", language: "en", generalArea: "", citizenshipCountry: "" });
  const [state, setState] = useState(emptyState);
  useEffect(() => {
    fetch("/api/profile", { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setProfile({ displayName: data.profile?.display_name || "", language: data.profile?.preferred_language || "en", generalArea: data.profile?.general_area || "", citizenshipCountry: data.profile?.citizenship_country || "" });
      }
    }).finally(() => setLoading(false));
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ busy: true, message: "Saving your profile…", error: false });
    const response = await sendApi("/api/profile", profile, "PATCH");
    const data = await response.json().catch(() => ({}));
    setState({ busy: false, message: response.ok ? "Profile saved." : data.error || "Could not save your profile.", error: !response.ok });
  }
  if (loading) return <div className="empty-state"><span className="loading-dot" /> Loading your private profile…</div>;
  if (!user) return <div className="notice-card notice-warm"><LockKeyhole size={18} /><div><strong>Your account is private.</strong><p>Sign in to view your profile, saved stories, concerns and learning progress.</p><Link className="text-link" href="/sign-in">Continue to sign in <ArrowRight size={15} /></Link></div></div>;
  return <div className="account-grid"><section className="account-panel"><span className="section-kicker">YOUR CIVIC LINK ACCOUNT</span><h2>{user.name}</h2><p>{user.email || "Email not provided by sign-in service"}</p><div className="status-row"><span className="status-indicator" /> Signed in <span className="status-divider">·</span> Account role: {user.roles.join(", ") || "member"}</div><SignOutButton /></section><form className="form-card" onSubmit={save}><div className="form-heading"><span className="form-icon"><Save size={17} /></span><div><h3>Profile preferences</h3><p>Only collect information needed for this account.</p></div></div><label>Preferred display name<input maxLength={80} value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} /></label><label>Preferred language<select value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}><option value="en">English</option><option value="lg">Luganda</option><option value="sw">Kiswahili</option><option value="luo">Luo</option><option value="rn">Runyankole-Rukiga</option><option value="ach">Acholi</option></select></label><label>General area <span className="optional">Optional</span><input maxLength={120} placeholder="District or general area" value={profile.generalArea} onChange={(event) => setProfile({ ...profile, generalArea: event.target.value })} /></label><label>Country of citizenship <span className="optional">Optional</span><select value={profile.citizenshipCountry} onChange={(event) => setProfile({ ...profile, citizenshipCountry: event.target.value })}><option value="">Prefer not to disclose</option><option value="Uganda">Uganda</option><option value="Other">Other country</option></select><small>This is self-reported and does not verify citizenship.</small></label><button className="button button-navy" disabled={state.busy}>{state.busy ? "Saving…" : "Save preferences"}<ArrowRight size={16} /></button>{state.message && <p className={state.error ? "form-message error" : "form-message"}>{state.message}</p>}</form></div>;
}

export function RoleRequestForm() {
  const [state, setState] = useState(emptyState);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ busy: true, message: "Submitting request…", error: false });
    const response = await sendApi("/api/role-requests", { requestedRole: form.get("requestedRole"), reason: form.get("reason") });
    const data = await response.json().catch(() => ({}));
    if (response.ok) event.currentTarget.reset();
    setState({ busy: false, message: response.ok ? data.message : data.error || "Could not send request.", error: !response.ok });
  }
  return <form className="role-request-form" onSubmit={submit}><label>Request an account role<select name="requestedRole"><option value="journalist">Journalist / media contributor</option><option value="civic_educator">Civic educator</option><option value="public_representative">Public representative</option><option value="government_representative">Government or institutional representative</option><option value="moderator">Content moderator</option><option value="administrator">Administrator</option></select></label><label>Why do you need this role? <span className="optional">Optional</span><textarea name="reason" maxLength={1000} rows={3} /></label><button className="button button-outline" disabled={state.busy}>{state.busy ? "Sending…" : "Request review"}<ChevronRight size={15} /></button>{state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}{state.error && state.message.startsWith("Sign in") && <> <Link href="/sign-in">Sign in</Link></>}</p>}<p className="form-note">A request never grants privileges by itself. An authorized reviewer must approve it.</p></form>;
}

export function PrivacyRequestButton() {
  const [state, setState] = useState(emptyState);
  async function request(type: "access" | "deletion") {
    setState({ busy: true, message: "Sending request…", error: false });
    const response = await sendApi("/api/privacy-requests", { type });
    const data = await response.json().catch(() => ({}));
    setState({ busy: false, message: response.ok ? "Your request has been recorded." : data.error || "Request could not be sent.", error: !response.ok });
  }
  return <div className="privacy-actions"><button className="button button-outline" disabled={state.busy} onClick={() => request("access")}>Request my data</button><button className="button button-outline" disabled={state.busy} onClick={() => request("deletion")}>Request account deletion</button>{state.message && <p className={state.error ? "form-message error" : "form-message"} role="status">{state.message}</p>}</div>;
}

type StaffSummary = {
  role?: string;
  concerns?: { id: string; subject: string; status: string; createdAt: string }[];
  roleRequests?: { id: string; requestedRole: string; reason: string | null; applicant: string }[];
  audit?: { action: string; objectType: string; createdAt: string }[];
  articles?: { slug: string; title: string; status: string; articleType: string; createdAt: string }[];
};
type StaffConcernDetail = { id: string; subject: string; description: string; generalArea: string | null; status: string; createdAt: string };

export function AdminGate({ area }: { area: "admin" | "editorial" }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  const [role, setRole] = useState("");
  const [summary, setSummary] = useState<StaffSummary>({});
  const [message, setMessage] = useState("");
  const [caseDetail, setCaseDetail] = useState<{ id: string; loading: boolean; concern?: StaffConcernDetail; updates?: { status: string; note: string | null; createdAt: string }[]; error?: string } | null>(null);
  useEffect(() => {
    fetch(`/api/${area}/summary`, { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (response.ok) { setState("allowed"); setRole(data.role || "authorized staff"); setSummary(data); }
      else setState(response.status === 403 || response.status === 401 ? "denied" : "error");
    }).catch(() => setState("error"));
  }, [area]);
  async function reviewRole(id: string, decision: "approved" | "rejected") {
    setMessage("");
    const response = await sendApi(`/api/admin/role-requests/${id}`, { decision }, "PATCH");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(data.error || "Role request could not be reviewed."); return; }
    setSummary((current) => ({ ...current, roleRequests: current.roleRequests?.filter((request) => request.id !== id) }));
    setMessage(`Role request ${decision}.`);
  }
  async function moveConcern(item: NonNullable<StaffSummary["concerns"]>[number]) {
    const next: Record<string, string> = { submitted: "acknowledged", acknowledged: "under_review", under_review: "response_published", response_published: "closed" };
    const status = next[item.status];
    if (!status) return;
    const note = status === "response_published" ? window.prompt("Enter the response to publish to the submitter’s private record:") : ({ acknowledged: "Staff acknowledged receipt of this concern.", under_review: "This concern is under review.", closed: "The concern workflow has been closed." } as Record<string, string>)[status];
    if (status === "response_published" && !note?.trim()) return;
    const response = await sendApi(`/api/admin/concerns/${item.id}`, { status, note }, "PATCH");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(data.error || "Concern status could not be updated."); return; }
    setSummary((current) => ({ ...current, concerns: current.concerns?.map((concern) => concern.id === item.id ? { ...concern, status } : concern) }));
    setCaseDetail(null);
    setMessage("Concern status updated. The submitter can view the explanation privately.");
  }
  async function showConcern(id: string) {
    if (caseDetail?.id === id && !caseDetail.loading) { setCaseDetail(null); return; }
    setCaseDetail({ id, loading: true });
    try {
      const response = await fetch(`/api/admin/concerns/${id}`, { credentials: "same-origin", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) { setCaseDetail({ id, loading: false, error: data.error || "Concern details could not be loaded." }); return; }
      setCaseDetail({ id, loading: false, concern: data.concern, updates: data.updates });
    } catch { setCaseDetail({ id, loading: false, error: "Concern details are temporarily unavailable." }); }
  }
  if (state === "loading") return <div className="empty-state"><span className="loading-dot" /> Checking your approved permissions…</div>;
  if (state === "denied") return <section className="access-denied"><span className="lock-badge"><LockKeyhole size={19} /></span><span className="section-kicker">RESTRICTED WORKSPACE</span><h2>Access is approval-gated.</h2><p>This area is limited to authorized {area === "admin" ? "administrators" : "editorial staff"}. Choosing a role does not provide access. Sign in first, then submit a role request for review.</p><Link className="button button-outline" href="/account">Go to account <ArrowRight size={15} /></Link><RoleRequestForm /></section>;
  if (state === "error") return <div className="notice-card notice-warm"><LockKeyhole size={18} /><p>The permission service is temporarily unavailable. No privileged content has been loaded.</p></div>;
  return <section className="staff-workspace"><div className="notice-card notice-success"><Check size={18} /><p>Authorized workspace session: {role}. Role checks are verified by the server.</p></div>{message && <p className="form-message" role="status">{message}</p>}{area === "admin" ? <><div className="staff-queue-grid"><section className="staff-queue"><span className="section-kicker">PRIVATE CONCERN QUEUE</span><h2>Open submissions</h2>{summary.concerns?.length ? summary.concerns.map((item) => <div className="staff-case-wrap" key={item.id}><article className="staff-row"><div><strong>{item.subject}</strong><small>{item.status.replaceAll("_", " ")} · {new Date(item.createdAt).toLocaleDateString()}</small></div><div className="staff-row-actions"><button className="button button-small button-outline" onClick={() => showConcern(item.id)}>{caseDetail?.id === item.id ? "Hide case" : "Review case"}</button><button className="button button-small button-outline" onClick={() => moveConcern(item)}>{item.status === "response_published" ? "Close" : item.status === "under_review" ? "Publish response" : item.status === "acknowledged" ? "Review" : "Acknowledge"}</button></div></article>{caseDetail?.id === item.id && <div className="staff-case-detail">{caseDetail.loading ? <p>Loading authorized case details…</p> : caseDetail.error ? <p>{caseDetail.error}</p> : caseDetail.concern && <><span className="section-kicker">PRIVATE CASE DETAILS · {caseDetail.concern.generalArea || "AREA NOT PROVIDED"}</span><p>{caseDetail.concern.description}</p>{caseDetail.updates?.map((update, index) => <small key={`${update.status}-${index}`}>{update.status.replaceAll("_", " ")} · {update.note || "No explanation recorded"}</small>)}</>}</div>}</div>) : <p>No open concerns.</p>}</section><section className="staff-queue"><span className="section-kicker">ROLE APPROVALS</span><h2>Pending requests</h2>{summary.roleRequests?.length ? summary.roleRequests.map((request) => <article className="staff-row" key={request.id}><div><strong>{request.requestedRole.replaceAll("_", " ")} · {request.applicant}</strong><small>{request.reason || "No reason provided"}</small></div><div className="staff-row-actions"><button className="button button-small button-outline" onClick={() => reviewRole(request.id, "approved")}>Approve</button><button className="button button-small button-outline" onClick={() => reviewRole(request.id, "rejected")}>Reject</button></div></article>) : <p>No pending role requests.</p>}</section></div><section className="staff-queue audit-queue"><span className="section-kicker">RECENT AUDIT ACTIVITY</span><h2>Administrative actions</h2>{summary.audit?.length ? summary.audit.map((entry, index) => <div className="audit-row" key={`${entry.action}-${index}`}><strong>{entry.action.replaceAll("_", " ")}</strong><span>{entry.objectType}</span><small>{new Date(entry.createdAt).toLocaleString()}</small></div>) : <p>No audit entries yet.</p>}</section></> : <section className="staff-queue"><span className="section-kicker">EDITORIAL QUEUE</span><h2>Unpublished drafts</h2><p>Drafts remain unpublished until editorial review, fact-checking and approval are completed.</p>{summary.articles?.length ? summary.articles.map((article) => <article className="staff-row" key={article.slug}><div><strong>{article.title}</strong><small>{article.articleType} · {article.status}</small></div><span className="case-status">{article.status}</span></article>) : <p>No drafts in the queue.</p>}</section>}</section>;
}

export function ConcernHistory() {
  const [items, setItems] = useState<{ id: string; subject: string; status: string; createdAt: string }[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/concerns", { credentials: "same-origin", cache: "no-store" }).then(async (response) => { const data = await response.json(); if (response.ok) setItems(data.concerns); else setMessage(data.error || "Sign in to track private concerns."); }).catch(() => setMessage("Concern service is temporarily unavailable.")); }, []);
  if (message) return <div className="notice-card notice-warm"><LockKeyhole size={18} /><p>{message} <Link href="/sign-in">Sign in</Link> to continue.</p></div>;
  if (!items.length) return <div className="empty-state"><p>No concern submissions yet. Any concern you submit will be private to your account and authorized staff.</p></div>;
  return <div className="concern-list">{items.map((item) => <article className="concern-row" key={item.id}><div><span className="story-category">PRIVATE · {new Date(item.createdAt).toLocaleDateString()}</span><h3>{item.subject}</h3><p>Tracking ID {item.id.slice(0, 8).toUpperCase()}</p></div><span className={`case-status case-${item.status}`}>{item.status.replaceAll("_", " ")}</span></article>)}</div>;
}

export function DataActionLink({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="text-link">{children}<ExternalLink size={14} /></Link>; }
