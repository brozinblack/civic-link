import { notFound } from "next/navigation";
import { AccountPage, AdminPage, PlaceholderPage, PrivacyPage, SignInPage, VerifyPage } from "@/components/pages";

const knownSections = new Set(["account", "sign-in", "verify", "editorial", "admin", "community", "media", "events", "privacy", "accountability"]);
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!knownSections.has(section)) return { title: "Page not found" };
  return { title: section.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) };
}

export default async function Page({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ error?: string }> }) {
  const { section } = await params;
  const query = await searchParams;
  if (!knownSections.has(section)) notFound();
  if (section === "account") return <AccountPage />;
  if (section === "sign-in") return <SignInPage error={query.error} />;
  if (section === "verify") return <VerifyPage />;
  if (section === "privacy") return <PrivacyPage />;
  if (section === "admin" || section === "editorial") return <AdminPage area={section} />;
  return <PlaceholderPage section={section} />;
}
