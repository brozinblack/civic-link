"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Info, Landmark, Search, Users } from "lucide-react";
import { representatives } from "@/lib/content";

export function RepresentativeBrowser() {
  const [term, setTerm] = useState("");
  const visible = representatives.filter((person) => `${person.name} ${person.office} ${person.area}`.toLowerCase().includes(term.toLowerCase()));
  return <>
    <label className="filter-search directory-search"><Search size={17} /><span className="sr-only">Search sample public profiles</span><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search by office or area" /></label>
    {visible.length ? <div className="leader-grid">{visible.map((person, index) => <article className="leader-card" key={person.slug}><div className="leader-avatar">{index === 1 ? <Landmark size={24} /> : <Users size={24} />}</div><span className="mini-category">{person.area}</span><h2><Link href={`/leaders/${person.slug}`}>{person.name}</Link></h2><p className="leader-office">{person.office}</p><span className="sample-status"><Info size={14} />{person.status}</span><Link className="card-cta" href={`/leaders/${person.slug}`}>View sample profile <ArrowRight size={15} /></Link></article>)}</div> : <div className="empty-state"><Search size={22} /><h3>No sample profiles match</h3><p>Try searching for a different office or area.</p></div>}
  </>;
}
