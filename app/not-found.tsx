import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return <div className="site-width page-shell"><div className="placeholder-card"><span className="section-kicker">404 · NOT FOUND</span><h1>We couldn’t find that page.</h1><p>Try the Civic Link homepage or browse the public demo news and learning areas.</p><div className="placeholder-links"><Link className="button button-navy" href="/">Back home <ArrowLeft size={15} /></Link><Link className="button button-outline" href="/news">Browse news</Link></div></div></div>;
}
