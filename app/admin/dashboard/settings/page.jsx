"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Save, Globe, Shield, Bell, Mail, Database, Settings2,
  Eye, EyeOff, Zap, CheckCircle2, XCircle, Loader2, Sparkles, Bot
} from "lucide-react"
import { cn } from "@/lib/utils"

function ToggleSwitch({ defaultChecked = false, checked, onChange }) {
  const [on, setOn] = useState(defaultChecked)
  const isChecked = checked !== undefined ? checked : on

  const handleToggle = () => {
    if (onChange) {
      onChange(!isChecked)
    } else {
      setOn(!isChecked)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        isChecked ? "bg-[#6CBD45]" : "bg-slate-200 dark:bg-slate-800"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200",
          isChecked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  )
}

function FormField({ label, children, description }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  )
}

const inputClass = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/25 focus:border-[#6CBD45] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
const selectClass = "w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/25 focus:border-[#6CBD45] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white appearance-none cursor-pointer"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("ai")

  // Groq AI Settings state
  const [groqApiKey, setGroqApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile")
  
  // General settings state
  const [siteName, setSiteName] = useState("Genesis Incubation Centre")
  const [siteUrl, setSiteUrl] = useState("https://genesis.com")
  const [contactEmail, setContactEmail] = useState("admin@genesis.com")

  // Status & Feedback states
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [testingConnection, setTestingConnection] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saveResult, setSaveResult] = useState(null)

  // Load existing settings on page mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoadingSettings(true)
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (data.success && data.settings) {
          if (data.settings.groqApiKey !== undefined) setGroqApiKey(data.settings.groqApiKey)
          else if (data.settings.groq_api_key !== undefined) setGroqApiKey(data.settings.groq_api_key)

          if (data.settings.groqModel) setGroqModel(data.settings.groqModel)
          else if (data.settings.groq_model) setGroqModel(data.settings.groq_model)

          if (data.settings.siteName) setSiteName(data.settings.siteName)
          if (data.settings.siteUrl) setSiteUrl(data.settings.siteUrl)
          if (data.settings.contactEmail) setContactEmail(data.settings.contactEmail)
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [])

  // Test Groq AI Connection
  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          groqApiKey,
          groqModel
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || "Connection to Groq AI successful!"
        })
      } else {
        setTestResult({
          success: false,
          message: data.message || "Connection failed. Please check your Groq API Key."
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Error testing connection: ${err.message}`
      })
    } finally {
      setTestingConnection(false)
    }
  }

  // Save Settings to memoryStore
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    setSaveResult(null)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          groqApiKey,
          groqModel,
          siteName,
          siteUrl,
          contactEmail
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSaveResult({
          success: true,
          message: data.message || "Settings saved successfully to memoryStore!"
        })
        setTimeout(() => setSaveResult(null), 5000)
      } else {
        setSaveResult({
          success: false,
          message: data.message || "Failed to save settings."
        })
      }
    } catch (err) {
      setSaveResult({
        success: false,
        message: `Error saving settings: ${err.message}`
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const tabs = [
    { id: "ai", label: "Groq AI Settings", icon: Sparkles },
    { id: "general", label: "General", icon: Settings2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "email", label: "Email", icon: Mail },
    { id: "backup", label: "Backup", icon: Database },
  ]

  const renderAiSettings = () => (
    <div className="space-y-5">
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 pt-5 px-5 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent dark:from-emerald-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#6CBD45]/15 text-[#6CBD45]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Groq AI Configuration
                  <Badge className="bg-[#6CBD45]/20 text-[#6CBD45] border-none font-semibold text-xs">
                    LLM Engine
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure your Groq AI credentials and select the primary inference model for the platform assistant.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-6 pt-2 space-y-5">
          {/* Groq API Key Input */}
          <FormField
            label="Groq AI API Key"
            description="Enter your secret API key from console.groq.com. Stored securely in memoryStore.settings."
          >
            <div className="relative flex items-center">
              <input
                type={showApiKey ? "text" : "password"}
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
                placeholder="gsk_..."
                className={cn(inputClass, "pr-10 font-mono")}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </FormField>

          {/* AI Model Selector */}
          <FormField
            label="AI Model Selector"
            description="Select the default language model to process AI queries and assistant chats."
          >
            <select
              value={groqModel}
              onChange={(e) => setGroqModel(e.target.value)}
              className={selectClass}
            >
              <option value="llama-3.3-70b-versatile" className="bg-white dark:bg-[#141824]">
                llama-3.3-70b-versatile (Recommended - High Capacity & Accuracy)
              </option>
              <option value="llama3-8b-8192" className="bg-white dark:bg-[#141824]">
                llama3-8b-8192 (Fast Response & Lightweight)
              </option>
              <option value="mixtral-8x7b-32768" className="bg-white dark:bg-[#141824]">
                mixtral-8x7b-32768 (MoE Architecture - 32k Context)
              </option>
            </select>
          </FormField>

          {/* Action Row: Test Connection & Save */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold gap-2"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#6CBD45]" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#6CBD45]" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white shadow-sm rounded-xl font-bold gap-2"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save AI Settings
                </>
              )}
            </Button>
          </div>

          {/* Connection Test Result Banner */}
          {testResult && (
            <div
              className={cn(
                "p-3.5 rounded-xl border flex items-start gap-3 text-sm animate-in fade-in duration-200",
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
              )}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.success ? "Connection Verified" : "Test Failed"}</p>
                <p className="text-xs mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderGeneral = () => (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#6CBD45]" /> Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Site Name">
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Site URL">
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
          <FormField label="Contact Email">
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6CBD45]" /> Password & Security Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <SettingRow label="Minimum Password Length" description="Set minimum characters required">
            <select className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CBD45]/25">
              <option value="8">8 characters</option>
              <option value="10">10 characters</option>
              <option value="12">12 characters</option>
            </select>
          </SettingRow>
          <SettingRow label="Require Special Characters" description="Force users to include symbols">
            <ToggleSwitch defaultChecked={true} />
          </SettingRow>
          <SettingRow label="Two-Factor Authentication" description="Enable 2FA for admin accounts">
            <ToggleSwitch defaultChecked={false} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#6CBD45]" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <SettingRow label="New Applications" description="Get notified when a startup submits an application">
            <ToggleSwitch defaultChecked={true} />
          </SettingRow>
          <SettingRow label="Event Reminders" description="Receive notifications for upcoming scheduled events">
            <ToggleSwitch defaultChecked={true} />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  )

  const renderEmail = () => (
    <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#6CBD45]" /> SMTP Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="SMTP Server">
            <input type="text" defaultValue="smtp.gmail.com" className={inputClass} />
          </FormField>
          <FormField label="Port">
            <input type="number" defaultValue="587" className={inputClass} />
          </FormField>
        </div>
      </CardContent>
    </Card>
  )

  const [initializingDb, setInitializingDb] = useState(false)
  const [dbInitResult, setDbInitResult] = useState(null)

  const handleInitDb = async () => {
    try {
      setInitializingDb(true)
      setDbInitResult(null)
      const res = await fetch("/api/admin/system/init-db", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setDbInitResult({
          type: "success",
          message: `Success: Verified & Auto-Generated ${data.data?.createdTables?.length || 12} Database Tables!`
        })
      } else {
        setDbInitResult({
          type: "error",
          message: `Error initializing DB: ${data.message || "Failed"}`
        })
      }
    } catch (err) {
      setDbInitResult({
        type: "error",
        message: "Network error initializing database tables"
      })
    } finally {
      setInitializingDb(false)
    }
  }

  const renderBackup = () => (
    <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-[#6CBD45]" /> Database & Schema Auto-Generator
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Auto-create all missing MySQL database tables (12 tables schema) with 1-click
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Auto-Generate Missing Database Tables</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Checks 12 tables (events, registrations, volunteer keys, admins, blogs, etc.) and executes CREATE TABLE IF NOT EXISTS.
            </p>
          </div>

          <Button
            onClick={handleInitDb}
            disabled={initializingDb}
            className="bg-gradient-to-r from-[#6CBD45] to-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl gap-2 shadow-md shrink-0"
          >
            {initializingDb ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Tables...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate DB Tables</span>
              </>
            )}
          </Button>
        </div>

        {dbInitResult && (
          <div className={cn(
            "p-3 rounded-xl text-xs font-mono border flex items-center gap-2",
            dbInitResult.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          )}>
            {dbInitResult.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{dbInitResult.message}</span>
          </div>
        )}

        <SettingRow label="Automatic Backups" description="Enable daily memoryStore and DB snapshotting">
          <ToggleSwitch defaultChecked={true} />
        </SettingRow>
      </CardContent>
    </Card>
  )

  const tabContent = {
    ai: renderAiSettings(),
    general: renderGeneral(),
    security: renderSecurity(),
    notifications: renderNotifications(),
    email: renderEmail(),
    backup: renderBackup(),
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
            Manage Groq AI API credentials, model defaults, and platform parameters
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="bg-[#6CBD45] hover:bg-[#5ba83a] text-white shadow-md shadow-[#6CBD45]/25 rounded-xl gap-2 w-fit font-bold"
        >
          {savingSettings ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Global Save Feedback Alert */}
      {saveResult && (
        <div
          className={cn(
            "p-4 rounded-xl border flex items-center gap-3 text-sm animate-in fade-in duration-200",
            saveResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
          )}
        >
          {saveResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span className="font-semibold">{saveResult.message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Settings Nav */}
        <Card className="bg-white dark:bg-[#141824]/90 border border-slate-200 dark:border-slate-800/80 shadow-sm lg:w-60 h-fit">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {(tabs || []).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setTestResult(null)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-[#6CBD45] text-white shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  )
}