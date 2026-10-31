"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";

type Concern = { id: string; subject: string; generalArea: string | null; status: string; createdAt: string; latestNote: string | null };
export function ConcernDetail({ id }: { id: string }) {
  const [item, setItem] = useState<Concern | null>(null);
  const [state, setState] = useState("Loading your private status…");
  useEffect(() => {
    fetch("/api/concerns", { credentials: "same-origin", cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) { setState(data.error || "Sign in to access this private record."); return; }
      const match = data.concerns.find((entry: Concern) => entry.id === id);
      if (!match) { setState("This record was not found in your account."); return; }
      setItem(match); setState("");
    }).catch(() => setState("Concern status is temporarily unavailable."));
  }, [id]);
  if (!item) return <div className="notice-card notice-warm"><LockKeyhole size={18} /><p>{state} <Link href="/sign-in">Sign in</Link></p></div>;
  return <section className="concern-detail-card"><span className="story-category">PRIVATE · SUBMITTED {new Date(item.createdAt).toLocaleDateString()}</span><h2>{item.subject}</h2><p>{item.generalArea || "No general area provided"}</p><span className={`case-status case-${item.status}`}>{item.status.replaceAll("_", " ")}</span>{item.latestNote && <div className="status-explanation"><strong>Latest status update</strong><p>{item.latestNote}</p></div>}<p className="small-note">Tracking reference: {item.id.slice(0, 8).toUpperCase()}</p><Link href="/concerns" className="text-link"><ArrowLeft size={15} /> Back to your concerns</Link></section>;
}
