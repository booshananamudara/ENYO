import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <div className="pl-60">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
