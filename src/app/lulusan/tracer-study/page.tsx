import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import TracerStudyForm from "./TracerStudyForm";

export default async function TracerStudyPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "LULUSAN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="lulusan" />
      <main className="flex-1 p-8 pr-8">
        <Topbar title="Tracer Study" profileHref="/lulusan/profil" />
        <TracerStudyForm />
      </main>
    </div>
  );
}
