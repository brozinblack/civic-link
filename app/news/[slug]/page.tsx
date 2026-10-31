import { notFound } from "next/navigation";
import { articles } from "@/lib/content";
import { ArticlePage } from "@/components/pages";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((entry) => entry.slug === slug);
  return article ? { title: article.title, description: article.excerpt } : { title: "Story not found" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!articles.some((article) => article.slug === slug)) notFound();
  return <ArticlePage slug={slug} />;
}
