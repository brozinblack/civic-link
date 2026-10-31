import { notFound } from "next/navigation";
import { representatives } from "@/lib/content";
import { LeaderProfilePage } from "@/components/pages";

export function generateStaticParams() { return representatives.map((person) => ({ slug: person.slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!representatives.some((person) => person.slug === slug)) notFound();
  return <LeaderProfilePage slug={slug} />;
}
