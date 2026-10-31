"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, LockKeyhole, MessageSquareText } from "lucide-react";

type Activity = {
  saved: { slug: string; title: string; category: string }[];
  progress: { courseSlug: string; progressPercent: number }[];
  concerns: { id: string; subject: string; status: string }[];
  questions: { id: string; representativeSlug: string; question: string; status: string }[];
};
const blank: Activity = { saved: [], progress: [], concerns: [], questions: [] };

export function PrivateOverview() {
  const [activity, setActivity] = useState(blank);
  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  useEffect(() => {
    const urls = ["/api/saved", "/api/progress", "/api/concerns", "/api/questions"];
    Promise.all(urls.map((url) => fetch(url, { credentials: "same-origin", cache: "no-store" }).then(async (response) => ({ response, data: await response.json() })))).then((results) => {
      if (results.some(({ response }) => response.status === 401)) { setState("signed-out"); return; }
      if (results.some(({ response }) => !response.ok)) { setState("error"); return; }
      setActivity({ saved: results[0].data.articles, progress: results[1].data.progress, concerns: results[2].data.concerns, questions: results[3].data.questions });
      setState("ready");
    }).catch(() => setState("error"));
  }, []);
  if (state === "loading") return <section className="private-overview"><span className="section-kicker">PRIVATE ACTIVITY</span><p><span className="loading-dot" /> Loading your account activity…</p></section>;
  if (state === "signed-out") return <section className="private-overview"><span className="section-kicker">PRIVATE ACTIVITY</span><div className="notice-card notice-warm"><LockKeyhole size={17} /><p>Sign in to view saved stories, learning progress, questions and private concerns. <Link href="/sign-in">Sign in</Link></p></div></section>;
  if (state === "error") return <section className="private-overview"><span className="section-kicker">PRIVATE ACTIVITY</span><div className="notice-card notice-warm"><LockKeyhole size={17} /><p>Account activity is temporarily unavailable. Your private information was not loaded.</p></div></section>;
  return <section className="private-overview"><div className="section-heading"><div><span className="section-kicker">PRIVATE ACCOUNT ACTIVITY</span><h2>Your saved work</h2></div><span className="pill-muted"><LockKeyhole size={13} /> Visible only to you</span></div><div className="activity-grid"><ActivityBlock icon={<Bookmark size={16} />} title="Saved stories" empty="No saved stories yet.">{activity.saved.map((row) => <Link href={`/news/${row.slug}`} className="activity-link" key={row.slug}><span>{row.title}</span><ArrowRight size={13} /></Link>)}</ActivityBlock><ActivityBlock icon={<BookOpen size={16} />} title="Learning progress" empty="No course progress saved.">{activity.progress.map((row) => <Link href={`/learn/${row.courseSlug}`} className="activity-link" key={row.courseSlug}><span>{row.courseSlug.replaceAll("-", " ")} · {row.progressPercent}%</span><ArrowRight size={13} /></Link>)}</ActivityBlock><ActivityBlock icon={<LockKeyhole size={16} />} title="Private concerns" empty="No concerns submitted.">{activity.concerns.map((row) => <Link href={`/concerns/${row.id}`} className="activity-link" key={row.id}><span>{row.subject} <small>{row.status.replaceAll("_", " ")}</small></span><ArrowRight size={13} /></Link>)}</ActivityBlock><ActivityBlock icon={<MessageSquareText size={16} />} title="Questions" empty="No questions submitted.">{activity.questions.map((row) => <div className="activity-link activity-static" key={row.id}><span>{row.question}<small>{row.status.replaceAll("_", " ")}</small></span></div>)}</ActivityBlock></div></section>;
}

function ActivityBlock({ icon, title, empty, children }: { icon: React.ReactNode; title: string; empty: string; children: React.ReactNode }) {
  return <div className="activity-block"><h3>{icon}{title}</h3>{children || <p>{empty}</p>}</div>;
}
