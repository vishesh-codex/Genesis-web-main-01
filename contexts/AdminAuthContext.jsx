// contexts/AdminAuthContext.jsx
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
    const [admin, setAdmin] = useState(null)
    const [permissions, setPermissions] = useState({})
    const [isSuper, setIsSuper] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAdmin()
    }, [])

    const fetchAdmin = async () => {
        try {
            const res = await fetch("/api/auth/verify")
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.user) {
                    setAdmin(data.user)
                    const superFlag = !!data.user.is_super || data.user.username === 'admin' || data.user.role_slug === 'super-admin' || data.user.role_slug === 'super_admin'
                    setIsSuper(superFlag)
                    setPermissions(data.user.permissions || {})
                }
            }
        } catch (e) {
            // not authenticated
        } finally {
            setLoading(false)
        }
    }

    /**
     * hasPermission(key) → true if super admin OR permissions[key] is true
     */
    const hasPermission = (key) => {
        if (isSuper) return true
        if (admin?.username === 'admin') return true
        if (admin?.is_super) return true
        if (admin?.role_slug === 'super-admin' || admin?.role_slug === 'super_admin') return true
        if (permissions?.all) return true
        if (key === 'dashboard') return true
        return permissions?.[key] === true
    }

    return (
        <AdminAuthContext.Provider value={{ admin, permissions, isSuper: isSuper || admin?.username === 'admin', hasPermission, loading, refresh: fetchAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    )
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext)
    if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>")
    return ctx
}

