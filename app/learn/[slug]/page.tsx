import { notFound } from "next/navigation";
import { courses } from "@/lib/content";
import { CoursePage } from "@/components/pages";

export function generateStaticParams() { return courses.map((course) => ({ slug: course.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find((entry) => entry.slug === slug);
  return course ? { title: course.title, description: course.summary } : { title: "Course not found" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!courses.some((course) => course.slug === slug)) notFound();
  return <CoursePage slug={slug} />;
}
