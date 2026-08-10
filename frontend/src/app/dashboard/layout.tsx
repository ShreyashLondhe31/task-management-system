import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "./SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white">
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
