import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <Sidebar />
      <main className="pt-14 lg:pl-60">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
