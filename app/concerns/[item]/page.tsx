import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ConcernForm } from "@/components/interactive";
import { PageTitle } from "@/components/pages";
import { ConcernDetail } from "@/components/concern-detail";

export async function generateMetadata({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  return { title: item === "new" ? "Submit a community concern" : "Private concern status" };
}

export default async function Page({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  if (item === "new") return <div className="site-width page-shell"><div className="breadcrumb"><Link href="/">Home</Link><ChevronRight size={14} /><Link href="/concerns">Community concerns</Link><ChevronRight size={14} /> Submit</div><PageTitle kicker="PRIVATE CITIZEN SUBMISSION" title="Submit a community concern" description="Your submission stays private to your account and authorized staff. An official response is not guaranteed." /><ConcernForm /></div>;
  return <div className="site-width page-shell"><div className="breadcrumb"><Link href="/">Home</Link><ChevronRight size={14} /><Link href="/concerns">Community concerns</Link><ChevronRight size={14} /> Private status</div><PageTitle kicker="YOUR PRIVATE RECORD" title="Concern status" description="Only your own submission is shown here." /><ConcernDetail id={item} /></div>;
}
