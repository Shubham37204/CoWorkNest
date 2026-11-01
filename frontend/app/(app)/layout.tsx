import ProtectedPage from "@/components/auth/protected-page";
import Navbar from "@/components/layout/navbar";

export const instant = false;
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedPage>
      <Navbar />
      {children}
    </ProtectedPage>
  );
}
