// app/p/[slug]/page.jsx
// Server Component — for SEO and performance

import Header from "@/components/header"
import Footer from "@/components/footer"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Render } from "@puckeditor/core";
import { config } from "@/lib/puck-config";

// ─── Fetch page data on the server ──────────────────────────────────────────
async function getPage(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/pages/${slug}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ─── Detect legacy GrapesJS content ──────────────────────────────────────────
function isLegacyContent(content) {
  return (
    content &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    !content.content && // Puck data has a content field
    (typeof content.html === "string" || typeof content.css === "string")
  )
}

// ─── Detect Puck content ─────────────────────────────────────────────────────
function isPuckContent(content) {
  return content && typeof content === "object" && Array.isArray(content.content);
}

// ─── SEO metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: "Page Not Found | Genesis" }
  return {
    title: `${page.title} | Genesis`,
    description: page.description || "",
  }
}

// ─── Page Component (async Server Component) ────────────────────────────────
export default async function CustomPageRenderer({ params }) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 bg-white">
          <div className="text-center" style={{ maxWidth: "28rem" }}>
            <div
              style={{
                width: "5rem", height: "5rem", backgroundColor: "#fef2f2",
                borderRadius: "9999px", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 1.5rem", color: "#ef4444",
              }}
            >
              <AlertCircle style={{ width: "2.5rem", height: "2.5rem" }} />
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Page Not Found
            </h1>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              We couldn&apos;t find the page you&apos;re looking for.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block", backgroundColor: "#6CBD45", color: "white",
                padding: "0.625rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const content = page.content

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden custom-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-page-wrapper {
          --primary: #6CBD45;
          --primary-foreground: #ffffff;
          font-family: var(--font-inter), sans-serif !important;
        }
        /* Force utility colors in case global theme variables are overridden */
        .custom-page-wrapper .bg-primary {
          background-color: #6CBD45 !important;
          color: #ffffff !important;
        }
        .custom-page-wrapper .text-primary {
          color: #6CBD45 !important;
        }
        /* Match Home Page expansive width (1536px / 2xl) */
        .custom-page-wrapper .container {
          max-width: 1536px !important;
        }
        /* Force Universal Inter Font */
        .custom-page-wrapper *, 
        .custom-page-wrapper p, 
        .custom-page-wrapper h1, 
        .custom-page-wrapper h2, 
        .custom-page-wrapper h3, 
        .custom-page-wrapper h4, 
        .custom-page-wrapper span, 
        .custom-page-wrapper button {
          font-family: var(--font-inter), sans-serif !important;
        }
      ` }} />
      <Header />

      <main className="flex-1 w-full bg-white">
        {isLegacyContent(content) ? (
          // Legacy GrapesJS page
          <div className="container mx-auto px-4 lg:px-6 py-10">
            {content.css && (
              <style dangerouslySetInnerHTML={{ __html: content.css }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: content.html || "" }} />
          </div>
        ) : isPuckContent(content) ? (
          // Puck page
          <div className="puck-render w-full">
            <Render config={config} data={content} />
          </div>
        ) : (
          // Empty or ChaiBuilder legacy (which we can't render now)
          <div
            className="flex items-center justify-center min-h-[60vh] text-slate-400 container mx-auto text-center p-10"
          >
            <div className="max-w-md">
              <p className="mb-4">This page has no compatible content or needs to be recreated in the new editor.</p>
              <Link href={`/admin/dashboard/pages/edit/${page.id}`} className="text-[#6CBD45] hover:underline font-bold">
                 Open Editor to Build Page
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
