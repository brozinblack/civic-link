"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, CircleHelp, Menu, Newspaper, Search, ShieldCheck, Users } from "lucide-react";

type Session = { user: { name: string; email?: string | null; role: string } | null };

export function CivicMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="Civic Link Uganda home">
      <span className="brand-mark" aria-hidden="true"><span className="mark-loop mark-loop-a" /><span className="mark-loop mark-loop-b" /><span className="mark-dot" /></span>
      <span className="brand-wordmark"><strong>CIVIC LINK</strong><small>UGANDA</small></span>
    </Link>
  );
}

const navigation = [
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaders", label: "Your leaders", icon: Users },
  { href: "/concerns", label: "Have your say", icon: CircleHelp },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session["user"]>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/session", { credentials: "same-origin", cache: "no-store" })
      .then((response) => response.ok ? response.json() : { user: null })
      .then((data: Session) => { if (live) setSession(data.user); })
      .catch(() => { if (live) setSession(null); });
    return () => { live = false; };
  }, [pathname]);

  return (
    <>
      <div className="topline"><div className="site-width topline-inner"><span>Independent civic information for Uganda</span><span className="topline-right"><ShieldCheck size={13} aria-hidden="true" /> Non-partisan · Public-interest · Demo edition</span></div></div>
      <header className="site-header">
        <div className="site-width masthead">
          <CivicMark />
          <form action="/news" className="header-search" role="search">
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="site-search">Search news and civic learning</label>
            <input id="site-search" name="q" placeholder="Search news, topics, learning…" />
            <button type="submit" aria-label="Search"><span>Search</span></button>
          </form>
          <div className="account-actions">
            {session ? <><span className="session-greeting">Hello, {session.name.split(" ")[0]}</span><Link href="/account" className="button button-small button-outline">My account</Link></> : <Link href="/sign-in" className="button button-small button-navy">Sign in</Link>}
          </div>
          <button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={22} /></button>
        </div>
        <nav aria-label="Main navigation" className={`main-nav ${menuOpen ? "main-nav-open" : ""}`}>
          <div className="site-width nav-inner">
            {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined} onClick={() => setMenuOpen(false)}><Icon size={16} aria-hidden="true" />{label}</Link>)}
            <Link className="nav-more" href="/events" onClick={() => setMenuOpen(false)}>Events & media <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-width footer-grid">
        <div><CivicMark compact /><p className="footer-slogan">Informed Citizens.<br />Accountable Leadership.<br />A Better Uganda.</p></div>
        <div><h2>Explore</h2><Link href="/news">News and public affairs</Link><Link href="/learn">Civic learning</Link><Link href="/leaders">Find representatives</Link><Link href="/concerns">Community concerns</Link></div>
        <div><h2>About this demo</h2><p>Sample stories and placeholder records are for interface demonstration only. No identity verification is performed.</p><Link href="/privacy">Privacy and data use <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="site-width footer-bottom">
        <span>© {new Date().getFullYear()} Civic Link Uganda · MVP demonstration</span>
        <span className="photo-credit">Kampala skyline: <a href="https://commons.wikimedia.org/wiki/File:KampalaSkyline.jpg" target="_blank" rel="noreferrer">Omoo / Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a> &amp; GFDL</span>
      </div>
    </footer>
  );
}
