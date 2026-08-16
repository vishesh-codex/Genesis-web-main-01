// app/admin/dashboard/layout.jsx
import { AdminAuthProvider } from "@/contexts/AdminAuthContext"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminSidebar>{children}</AdminSidebar>
    </AdminAuthProvider>
  )
}