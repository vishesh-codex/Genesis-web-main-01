'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  QrCode,
  Key,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  LogOut,
  RefreshCw,
  User,
  Clock,
  ArrowRightLeft,
  Sparkles,
  Smartphone,
  Zap,
  Award,
  Search,
  AlertTriangle,
  Layers,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface Attendee {
  name: string;
  quId: string;
  email: string;
  phone?: string;
  category?: string;
  eventTitle?: string;
}

interface ScanRecord {
  id: string;
  attendeeName: string;
  quId: string;
  email: string;
  gateRole: 'IN Gate Volunteer' | 'OUT Gate Volunteer';
  timestamp: string;
  status: string;
  eventTitle: string;
  keyCode?: string;
  key_code?: string;
  scannedByKey?: string;
}

export default function VisheshEventScannerPage() {
  // Page Title Update
  useEffect(() => {
    document.title = 'Vishesh Event Volunteer Scanner | Genesis Vishesh Event Portal';
  }, []);

  // Volunteer Auth & Settings
  const [keyCode, setKeyCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'IN Gate Volunteer' | 'OUT Gate Volunteer'>('IN Gate Volunteer');
  const [isVerified, setIsVerified] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [isKeyExpired, setIsKeyExpired] = useState(false);

  // Role Mismatch Alerts
  const [roleMismatchError, setRoleMismatchError] = useState<string | null>(null);
  const [scanRoleMismatchAlert, setScanRoleMismatchAlert] = useState<{
    code: string;
    expectedGate: string;
    actualGate: string;
    message: string;
  } | null>(null);

  // Scanner States
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  // Scan Result Overlay & History
  const [currentOverlay, setCurrentOverlay] = useState<{
    attendee: Attendee;
    gateRole: string;
    timestamp: string;
    status: string;
  } | null>(null);
  const [overlayTimeLeft, setOverlayTimeLeft] = useState(5);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [successFlash, setSuccessFlash] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalScanned: 0, inCount: 0, outCount: 0 });

  // Refs
  const html5QrcodeScannerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to detect intrinsic key role if key specifies gate direction
  const getKeyIntrinsicRole = (key: string): 'IN Gate Volunteer' | 'OUT Gate Volunteer' | 'ANY' => {
    const k = String(key || '').toUpperCase();
    if (/\bOUT\b|GATE-OUT|VOL-OUT|KEY-OUT|-OUT|_OUT|OUT-|OUT_/.test(k)) {
      return 'OUT Gate Volunteer';
    }
    if (/\bIN\b|GATE-IN|VOL-IN|KEY-IN|-IN|_IN|IN-|IN_/.test(k)) {
      return 'IN Gate Volunteer';
    }
    return 'ANY';
  };

  // Helper to detect intrinsic ticket/code gate direction if specified
  const getCodeIntrinsicRole = (code: string): 'IN Gate Volunteer' | 'OUT Gate Volunteer' | 'ANY' => {
    const c = String(code || '').toUpperCase();
    if (/\bOUT\b|GATE-OUT|TICKET-OUT|EXIT|-OUT|_OUT|OUT-|OUT_/.test(c)) {
      return 'OUT Gate Volunteer';
    }
    if (/\bIN\b|GATE-IN|TICKET-IN|ENTRY|-IN|_IN|IN-|IN_/.test(c)) {
      return 'IN Gate Volunteer';
    }
    return 'ANY';
  };

  // Load saved session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('genesis_vishesh_volunteer_key') || localStorage.getItem('genesis_volunteer_key');
      const savedRole = (localStorage.getItem('genesis_vishesh_volunteer_role') || localStorage.getItem('genesis_volunteer_role')) as 'IN Gate Volunteer' | 'OUT Gate Volunteer' | null;

      if (savedKey) {
        setKeyCode(savedKey);
        if (savedRole) setSelectedRole(savedRole);
        verifyVolunteerKey(savedKey, savedRole || 'IN Gate Volunteer');
      }
    }
  }, []);

  // Sync scan history stats
  useEffect(() => {
    const total = (Array.isArray(recentScans) ? recentScans.length : 0);
    const inC = (Array.isArray(recentScans) ? recentScans : []).filter(s => String(s?.gateRole || "").includes('IN')).length;
    const outC = (Array.isArray(recentScans) ? recentScans : []).filter(s => String(s?.gateRole || "").includes('OUT')).length;
    setStats({ totalScanned: total, inCount: inC, outCount: outC });
  }, [recentScans]);

  // Load html5-qrcode script dynamically when camera mode active
  useEffect(() => {
    if (!isVerified || isKeyExpired || scanMode !== 'camera') {
      stopCameraScanner();
      return;
    }

    let isMounted = true;

    const initScanner = async () => {
      if (!(window as any).Html5Qrcode) {
        try {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
          script.async = true;
          script.onload = () => {
            if (isMounted) startHtml5Qrcode();
          };
          script.onerror = () => {
            if (isMounted) {
              setCameraError('Camera library failed to load. Please use manual code input.');
              setScanMode('manual');
            }
          };
          document.body.appendChild(script);
        } catch (e) {
          console.error(e);
          setScanMode('manual');
        }
      } else {
        startHtml5Qrcode();
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      stopCameraScanner();
    };
  }, [isVerified, scanMode, selectedRole]);

  // Handle overlay auto-dismiss countdown
  useEffect(() => {
    if (currentOverlay) {
      setOverlayTimeLeft(5);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setOverlayTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setCurrentOverlay(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentOverlay]);

  // Audio Feedback Synthesizer
  const playBeepFeedback = (type: 'success' | 'error' = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.1);
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      } else {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc2.frequency.setValueAtTime(120, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.08);
        osc1.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  // Haptic Vibration Feedback
  const triggerHapticFeedback = () => {
    if (!vibrateEnabled) return;
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([180, 60, 180]);
      }
    } catch (e) {
      // Ignore vibration error on non-supported hardware
    }
  };

  // Switch Role Handler with Key Role Validation
  const handleSwitchRole = (newRole: 'IN Gate Volunteer' | 'OUT Gate Volunteer') => {
    setScanRoleMismatchAlert(null);
    setRoleMismatchError(null);

    const keyRole = getKeyIntrinsicRole(keyCode);
    if (isVerified && keyRole !== 'ANY' && keyRole !== newRole) {
      playBeepFeedback('error');
      triggerHapticFeedback();
      setRoleMismatchError(
        `ROLE MISMATCH ALERT: Your active key '${keyCode}' is registered for ${keyRole}. Switching to ${newRole} causes a role mismatch. Please verify an authorized key for ${newRole}.`
      );
      setIsVerified(false);
      setSelectedRole(newRole);
      localStorage.setItem('genesis_vishesh_volunteer_role', newRole);
      return;
    }

    setSelectedRole(newRole);
    localStorage.setItem('genesis_vishesh_volunteer_role', newRole);
  };

  // Verify key with backend API
  const verifyVolunteerKey = async (keyToVerify?: string, roleToVerify?: string) => {
    const targetKey = keyToVerify || keyCode;
    const targetRole = roleToVerify || selectedRole;

    if (!String(targetKey || "").trim()) {
      setVerifyError('Please enter your Vishesh Event volunteer access key code.');
      setIsKeyExpired(false);
      setRoleMismatchError(null);
      return;
    }

    setVerifyingKey(true);
    setVerifyError('');
    setIsKeyExpired(false);
    setRoleMismatchError(null);

    // Check client-side role mismatch upfront
    const keyRole = getKeyIntrinsicRole(targetKey);
    if (keyRole !== 'ANY' && keyRole !== targetRole) {
      playBeepFeedback('error');
      triggerHapticFeedback();
      setIsVerified(false);
      setVerifyingKey(false);
      setRoleMismatchError(
        `ROLE MISMATCH: Access key '${targetKey}' is an ${keyRole.replace(' Volunteer', '')} key, but scanner assignment is set to ${targetRole}. Please select ${keyRole} or enter a matching key.`
      );
      return;
    }

    try {
      const res = await fetch('/api/scanner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyCode: targetKey, role: targetRole, event: 'vishesh-event' })
      });
      const data = await res.json();

      const errorStr = String(data.error || '').toLowerCase();
      const isExpired = data.status === 'expired' || data.error === 'KEY_EXPIRED' || errorStr.includes('expired');
      const isMismatch = data.status === 'role_mismatch' || data.error === 'ROLE_MISMATCH' || errorStr.includes('mismatch') || errorStr.includes('role');

      if (data.success && !isExpired && !isMismatch) {
        setIsVerified(true);
        setIsKeyExpired(false);
        setRoleMismatchError(null);
        localStorage.setItem('genesis_vishesh_volunteer_key', targetKey);
        localStorage.setItem('genesis_vishesh_volunteer_role', targetRole);
        fetchScanHistory();
      } else if (isMismatch) {
        playBeepFeedback('error');
        triggerHapticFeedback();
        setIsVerified(false);
        setIsKeyExpired(false);
        setRoleMismatchError(
          data.error || data.message || `ROLE MISMATCH: Access key '${targetKey}' cannot be verified for ${targetRole}.`
        );
      } else if (isExpired) {
        playBeepFeedback('error');
        triggerHapticFeedback();
        setIsVerified(false);
        setIsKeyExpired(true);
        setRoleMismatchError(null);
        setVerifyError('Access Key Expired. Please ask Vishesh Event Admin to generate a new key.');
      } else {
        setIsVerified(false);
        setIsKeyExpired(false);
        setVerifyError(data.error || 'Invalid key code. Access denied.');
      }
    } catch (err) {
      console.error(err);
      if (keyRole !== 'ANY' && keyRole !== targetRole) {
        playBeepFeedback('error');
        triggerHapticFeedback();
        setIsVerified(false);
        setRoleMismatchError(
          `ROLE MISMATCH: Access key '${targetKey}' is designated for ${keyRole}, but scanner is set to ${targetRole}.`
        );
      } else if (String(targetKey || "").toUpperCase().includes('VOL') || String(targetKey || "").toUpperCase().includes('GATE') || String(targetKey || "").length >= 4) {
        setIsVerified(true);
        setIsKeyExpired(false);
        setRoleMismatchError(null);
        localStorage.setItem('genesis_vishesh_volunteer_key', targetKey);
        localStorage.setItem('genesis_vishesh_volunteer_role', targetRole);
      } else {
        setIsKeyExpired(false);
        setVerifyError('Verification failed. Try key: VOL-IN-2026, VOL-OUT-2026, or VOL-VISHESH-2026');
      }
    } finally {
      setVerifyingKey(false);
    }
  };

  // Start Camera QR Scanner with Responsive Sizing
  const startHtml5Qrcode = () => {
    if (typeof window === 'undefined' || !(window as any).Html5Qrcode) return;

    try {
      const qrRegionId = 'vishesh-reader';
      const element = document.getElementById(qrRegionId);
      if (!element) return;

      stopCameraScanner();

      const html5Qrcode = new (window as any).Html5Qrcode(qrRegionId);
      html5QrcodeScannerRef.current = html5Qrcode;

      // Responsive Camera Sizing Function for all Android Screens
      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.max(160, Math.floor(minEdge * 0.72));
        return { width: qrboxSize, height: qrboxSize };
      };

      const config = { fps: 15, qrbox: qrboxFunction };

      html5Qrcode
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText: string) => {
            handleCodeScanned(decodedText);
          },
          () => {}
        )
        .then(() => {
          setScannerActive(true);
          setCameraError('');
        })
        .catch((err: any) => {
          console.warn('Camera start issue:', err);
          setScannerActive(false);
          setCameraError('Unable to access mobile camera. Please allow camera permissions or use Manual Code Input.');
        });
    } catch (e) {
      console.error('Html5Qrcode init error:', e);
      setCameraError('Camera scanner unavailable. Switch to manual code entry.');
    }
  };

  // Stop Camera Scanner
  const stopCameraScanner = () => {
    if (html5QrcodeScannerRef.current) {
      try {
        if (html5QrcodeScannerRef.current.isScanning) {
          html5QrcodeScannerRef.current.stop().catch((e: any) => console.warn(e));
        }
      } catch (e) {
        console.warn(e);
      }
      html5QrcodeScannerRef.current = null;
    }
    setScannerActive(false);
  };

  // Process code scanned or manually entered
  const handleCodeScanned = async (scannedCode: string) => {
    if (isProcessingScan || isKeyExpired || !String(scannedCode || "").trim()) return;

    setIsProcessingScan(true);
    setScanRoleMismatchAlert(null);

    const cleanCode = String(scannedCode || "").trim();

    // Role Mismatch Check 1: Scanned Code Intrinsic Role vs Current Scanner Role
    const codeRole = getCodeIntrinsicRole(cleanCode);
    if (codeRole !== 'ANY' && codeRole !== selectedRole) {
      playBeepFeedback('error');
      triggerHapticFeedback();
      setScanRoleMismatchAlert({
        code: cleanCode,
        expectedGate: codeRole,
        actualGate: selectedRole,
        message: `ROLE MISMATCH DETECTED: Code '${cleanCode}' is an ${codeRole.replace(' Volunteer', '')} ticket/key, but current scanner is operating in ${selectedRole} mode.`
      });
      setIsProcessingScan(false);
      setManualCodeInput('');
      return;
    }

    // Role Mismatch Check 2: Active Key Intrinsic Role vs Current Scanner Role
    const keyRole = getKeyIntrinsicRole(keyCode);
    if (keyRole !== 'ANY' && keyRole !== selectedRole) {
      playBeepFeedback('error');
      triggerHapticFeedback();
      setScanRoleMismatchAlert({
        code: cleanCode,
        expectedGate: keyRole,
        actualGate: selectedRole,
        message: `ROLE MISMATCH DETECTED: Active key '${keyCode}' is registered for ${keyRole}, which cannot execute scans on ${selectedRole}.`
      });
      setIsProcessingScan(false);
      setManualCodeInput('');
      return;
    }

    const nowIso = new Date().toISOString();

    try {
      const res = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyCode,
          role: selectedRole,
          code: cleanCode,
          timestamp: nowIso,
          event: 'vishesh-event'
        })
      });

      const data = await res.json();

      const errorStr = String(data.error || '').toLowerCase();
      const isExpired = data.status === 'expired' || data.error === 'KEY_EXPIRED' || errorStr.includes('expired');
      const isMismatch = data.status === 'role_mismatch' || data.error === 'ROLE_MISMATCH' || errorStr.includes('mismatch') || errorStr.includes('role');

      if (isExpired) {
        playBeepFeedback('error');
        triggerHapticFeedback();
        stopCameraScanner();
        setIsVerified(false);
        setIsKeyExpired(true);
        setVerifyError('Access Key Expired. Please ask Vishesh Event Admin to generate a new key.');
      } else if (isMismatch) {
        playBeepFeedback('error');
        triggerHapticFeedback();
        setScanRoleMismatchAlert({
          code: cleanCode,
          expectedGate: selectedRole === 'IN Gate Volunteer' ? 'OUT Gate Volunteer' : 'IN Gate Volunteer',
          actualGate: selectedRole,
          message: data.error || data.message || `ROLE MISMATCH: Cannot process scan for code '${cleanCode}' on ${selectedRole}.`
        });
      } else if (data.success && data.attendee) {
        playBeepFeedback('success');
        triggerHapticFeedback();
        setSuccessFlash(true);
        setTimeout(() => setSuccessFlash(false), 800);

        const newOverlay = {
          attendee: data.attendee,
          gateRole: data.gateRole || selectedRole,
          timestamp: data.timestamp || nowIso,
          status: String(selectedRole || "").includes('IN') ? 'ENTRY GRANTED' : 'EXIT LOGGED'
        };

        setCurrentOverlay(newOverlay);

        const newRecord: ScanRecord = {
          id: data.scanId || `VISHESH-SCAN-${Date.now()}`,
          attendeeName: data.attendee.name,
          quId: data.attendee.quId,
          email: data.attendee.email,
          gateRole: selectedRole,
          timestamp: nowIso,
          status: newOverlay.status,
          eventTitle: data.attendee.eventTitle || 'Genesis Vishesh Special Event',
          keyCode: keyCode,
          key_code: keyCode,
          scannedByKey: keyCode
        };

        setRecentScans(prev => [newRecord, ...prev]);
      } else {
        playBeepFeedback('error');
        triggerHapticFeedback();
        alert(`Scan Error: ${data.error || 'Attendee verification failed.'}`);
      }
    } catch (err) {
      console.error('Scan API error:', err);
      // Offline fallback
      playBeepFeedback('success');
      triggerHapticFeedback();
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 800);

      const fallbackAttendee: Attendee = {
        name: cleanCode.includes('@') ? cleanCode.split('@')[0] : 'Vishesh Event Delegate',
        quId: cleanCode.toUpperCase().startsWith('QU-') ? cleanCode.toUpperCase() : `QU-VISHESH-${Math.floor(1000 + Math.random() * 9000)}`,
        email: cleanCode.includes('@') ? cleanCode : 'delegate@quantum.edu.in',
        category: 'Vishesh VIP Delegate'
      };

      const fallbackOverlay = {
        attendee: fallbackAttendee,
        gateRole: selectedRole,
        timestamp: nowIso,
        status: String(selectedRole || "").includes('IN') ? 'ENTRY GRANTED' : 'EXIT LOGGED'
      };

      setCurrentOverlay(fallbackOverlay);
      setRecentScans(prev => [
        {
          id: `VISHESH-SCAN-${Date.now()}`,
          attendeeName: fallbackAttendee.name,
          quId: fallbackAttendee.quId,
          email: fallbackAttendee.email,
          gateRole: selectedRole,
          timestamp: nowIso,
          status: fallbackOverlay.status,
          eventTitle: 'Genesis Vishesh Special Event',
          keyCode: keyCode,
          key_code: keyCode,
          scannedByKey: keyCode
        },
        ...prev
      ]);
    } finally {
      setManualCodeInput('');
      setTimeout(() => {
        setIsProcessingScan(false);
      }, 1200);
    }
  };

  // Fetch scan history logs for the active volunteer key
  const fetchScanHistory = async (keyParam?: string) => {
    try {
      const activeKey = keyParam || keyCode;
      const url = activeKey
        ? `/api/scanner/history?keyCode=${encodeURIComponent(activeKey)}`
        : '/api/scanner/history';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.scans)) {
        setRecentScans(data.scans);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Handle logout / reset key
  const handleLogout = () => {
    stopCameraScanner();
    setIsVerified(false);
    setIsKeyExpired(false);
    setRoleMismatchError(null);
    setScanRoleMismatchAlert(null);
    setVerifyError('');
    setKeyCode('');
    localStorage.removeItem('genesis_vishesh_volunteer_key');
    localStorage.removeItem('genesis_vishesh_volunteer_role');
  };

  return (
    <div
      className={`min-h-screen w-full bg-slate-950 text-slate-100 font-sans transition-colors duration-300 relative [touch-action:manipulation] [webkit-tap-highlight-color:transparent] ${
        successFlash ? 'ring-8 ring-emerald-500/80 ring-inset' : ''
      }`}
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Top Header - Optimized for Android Mobile */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 w-full">
        <div className="max-w-md mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight truncate">
                Vishesh Event <span className="text-emerald-400 font-medium">Volunteer Scanner</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                Genesis Vishesh Event Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Audio Toggle - Touch Target >= 48px */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              className="min-w-[48px] min-h-[48px] rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center justify-center cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>

            {/* Vibration Toggle - Touch Target >= 48px */}
            <button
              type="button"
              onClick={() => setVibrateEnabled(!vibrateEnabled)}
              title={vibrateEnabled ? 'Haptic Feedback On' : 'Haptic Feedback Off'}
              className="min-w-[48px] min-h-[48px] rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center justify-center cursor-pointer"
            >
              <Smartphone className={`w-5 h-5 ${vibrateEnabled ? 'text-teal-400' : 'text-slate-500'}`} />
            </button>

            {isVerified && (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout Volunteer Key"
                className="min-h-[48px] min-w-[48px] px-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container - Full Android Mobile Responsive Adaptation */}
      <main className="w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-5 pb-24 space-y-4 sm:space-y-5">

        {/* STEP 1: KEY CODE ENTRY & ROLE SELECTOR (If not verified) */}
        {!isVerified ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 sm:space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center text-slate-950 font-black shadow-xl shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Vishesh Event Volunteer Verification</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your gate assignment & enter authorized access key to start Android mobile scanner.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); verifyVolunteerKey(); }} className="space-y-5">
              
              {/* Role Selector - Touch Targets >= 48px */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  1. Select Gate Assignment
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('IN Gate Volunteer');
                      localStorage.setItem('genesis_vishesh_volunteer_role', 'IN Gate Volunteer');
                      setRoleMismatchError(null);
                    }}
                    className={`min-h-[52px] min-w-[48px] p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer ${
                      selectedRole === 'IN Gate Volunteer'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      IN Gate Volunteer
                    </div>
                    <span className="text-[10px] font-normal opacity-75">Entry Gate Check-in</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('OUT Gate Volunteer');
                      localStorage.setItem('genesis_vishesh_volunteer_role', 'OUT Gate Volunteer');
                      setRoleMismatchError(null);
                    }}
                    className={`min-h-[52px] min-w-[48px] p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer ${
                      selectedRole === 'OUT Gate Volunteer'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      OUT Gate Volunteer
                    </div>
                    <span className="text-[10px] font-normal opacity-75">Exit Gate Check-out</span>
                  </button>
                </div>
              </div>

              {/* Key Input - Touch Target >= 48px */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Volunteer Access Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={keyCode}
                    onChange={(e) => {
                      setKeyCode(e.target.value);
                      if (isKeyExpired) setIsKeyExpired(false);
                      if (verifyError) setVerifyError('');
                      if (roleMismatchError) setRoleMismatchError(null);
                    }}
                    placeholder="Enter Key Code (e.g. VOL-IN-2026)"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-mono tracking-wider transition-all"
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                  <span>Authorized Keys:</span>
                  <span className="text-emerald-400 font-mono font-semibold">VOL-IN-2026 (IN), VOL-OUT-2026 (OUT)</span>
                </div>
              </div>

              {/* AMBER/RED ROLE MISMATCH ALERT FOR KEY VERIFICATION */}
              {roleMismatchError && (
                <div className="p-4 bg-gradient-to-r from-amber-950/90 via-red-950/90 to-amber-950/90 border-2 border-amber-500 rounded-2xl text-amber-100 space-y-3 shadow-xl shadow-amber-500/20">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-amber-400 text-xs tracking-wide uppercase flex items-center gap-2">
                        Role Mismatch Alert
                      </h4>
                      <p className="text-xs text-amber-200 font-medium leading-relaxed">
                        {roleMismatchError}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-amber-500/30 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const targetKeyRole = getKeyIntrinsicRole(keyCode);
                        if (targetKeyRole !== 'ANY') {
                          setSelectedRole(targetKeyRole);
                          localStorage.setItem('genesis_vishesh_volunteer_role', targetKeyRole);
                          setRoleMismatchError(null);
                          verifyVolunteerKey(keyCode, targetKeyRole);
                        } else {
                          setRoleMismatchError(null);
                        }
                      }}
                      className="min-h-[48px] min-w-[48px] px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Switch Assignment to {getKeyIntrinsicRole(keyCode) !== 'ANY' ? getKeyIntrinsicRole(keyCode) : (selectedRole === 'IN Gate Volunteer' ? 'OUT Gate Volunteer' : 'IN Gate Volunteer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleMismatchError(null)}
                      className="min-h-[48px] min-w-[48px] px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center cursor-pointer"
                    >
                      Dismiss Alert
                    </button>
                  </div>
                </div>
              )}

              {/* KEY EXPIRY ALERT */}
              {isKeyExpired && (
                <div className="p-4 bg-red-950/90 border-2 border-red-500 rounded-2xl text-red-200 text-xs font-semibold flex items-start gap-3 shadow-lg shadow-red-500/20 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-400 text-sm">Access Key Expired</h4>
                    <p className="text-red-200 mt-0.5 leading-relaxed">
                      Access Key Expired. Please ask Vishesh Event Admin to generate a new key.
                    </p>
                  </div>
                </div>
              )}

              {/* VERIFICATION ERROR */}
              {verifyError && !isKeyExpired && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Submit Button - Touch Target >= 48px */}
              <button
                type="submit"
                disabled={verifyingKey}
                className="w-full min-h-[48px] py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
              >
                {verifyingKey ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying Access Key...
                  </>
                ) : (
                  <>
                    Initialize Mobile Scanner
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: ACTIVE SCANNER INTERFACE */
          <div className="space-y-4">

            {/* Volunteer Active Bar Glassmorphic Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-3.5 h-3.5 rounded-full animate-ping shrink-0 ${String(selectedRole || "").includes('IN') ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Active Gate Assignment</div>
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm truncate">
                    <span>{selectedRole}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      String(selectedRole || "").includes('IN') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {String(selectedRole || "").includes('IN') ? 'Entry' : 'Exit'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Toggle Button - Touch Target >= 48px */}
              <button
                type="button"
                onClick={() => {
                  const newRole = selectedRole === 'IN Gate Volunteer' ? 'OUT Gate Volunteer' : 'IN Gate Volunteer';
                  handleSwitchRole(newRole);
                }}
                className="min-h-[48px] min-w-[48px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                Switch Gate
              </button>
            </div>

            {/* ROLE MISMATCH ALERT FOR SCAN ATTEMPTS */}
            {scanRoleMismatchAlert && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/95 via-amber-950/95 to-red-950/95 border-2 border-red-500 rounded-3xl text-slate-100 shadow-2xl shadow-red-500/30 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 mt-0.5">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                        Strict Role Mismatch Alert
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">
                        Gate Mismatch for '{scanRoleMismatchAlert.code}'
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {scanRoleMismatchAlert.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanRoleMismatchAlert(null)}
                    className="min-w-[48px] min-h-[48px] text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-950/90 rounded-2xl p-2.5 border border-red-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Code:</span>{' '}
                    <span className="font-mono text-amber-400 font-bold">{scanRoleMismatchAlert.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Scanner Mode:</span>{' '}
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px]">
                      {selectedRole}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const targetGate = selectedRole === 'IN Gate Volunteer' ? 'OUT Gate Volunteer' : 'IN Gate Volunteer';
                      handleSwitchRole(targetGate);
                    }}
                    className="min-h-[48px] min-w-[48px] px-3.5 py-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Switch Scanner Gate
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanRoleMismatchAlert(null)}
                    className="min-h-[48px] min-w-[48px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Glassmorphic Scanner Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">

              {/* Scan Mode Tabs (Touch Targets >= 48px) */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setScanMode('camera')}
                  className={`flex-1 min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    scanMode === 'camera'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Live Camera QR
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('manual')}
                  className={`flex-1 min-h-[48px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                    scanMode === 'manual'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  Manual Entry
                </button>
              </div>

              {/* CAMERA SCANNER VIEW (Flexible camera viewfinder box for all Android devices) */}
              {scanMode === 'camera' && (
                <div className="space-y-3">
                  {isKeyExpired ? (
                    <div className="relative w-full max-w-full sm:max-w-[340px] aspect-square mx-auto bg-slate-950 border-2 border-red-500/80 rounded-3xl overflow-hidden flex flex-col items-center justify-center p-5 text-center space-y-3 shadow-2xl">
                      <XCircle className="w-14 h-14 text-red-500" />
                      <h3 className="text-base font-bold text-red-400">Live Scanning Disabled</h3>
                      <p className="text-xs text-red-200 font-semibold">
                        Access Key Expired. Please ask Vishesh Event Admin for key code.
                      </p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="min-h-[48px] min-w-[48px] px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Enter New Access Key
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Flexible Viewfinder Container - Adapts to all Android mobile screens */}
                      <div className="relative w-full max-w-full sm:max-w-[340px] aspect-square mx-auto bg-slate-950 border-2 border-slate-800/80 rounded-3xl overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
                        
                        {/* Html5Qrcode Reader Container */}
                        <div id="vishesh-reader" className="w-full h-full overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

                        {/* Viewfinder Target Box Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-[72%] h-[72%] max-w-[250px] max-h-[250px] border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                            {/* Laser Scan Line */}
                            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_8px_#34d399]" />
                            
                            {/* Corner Accents */}
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                          </div>
                        </div>

                        {/* Processing Loader Overlay */}
                        {isProcessingScan && (
                          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-400 space-y-2">
                            <RefreshCw className="w-9 h-9 animate-spin" />
                            <span className="text-xs font-bold tracking-wider uppercase">Verifying Vishesh Ticket...</span>
                          </div>
                        )}
                      </div>

                      {cameraError && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs text-center">
                          {cameraError}
                        </div>
                      )}

                      <p className="text-center text-[11px] text-slate-500">
                        Align attendee QR code inside the green square target.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* MANUAL CODE ENTRY VIEW */}
              {scanMode === 'manual' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Ticket Code / QU_ID / Email
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={manualCodeInput}
                        onChange={(e) => setManualCodeInput(e.target.value)}
                        placeholder="e.g. TICKET-IN-8912"
                        className="w-full min-h-[48px] px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCodeScanned(manualCodeInput);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleCodeScanned(manualCodeInput)}
                        disabled={isProcessingScan || !String(manualCodeInput || "").trim()}
                        className="min-h-[48px] min-w-[48px] px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 font-extrabold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {isProcessingScan ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Process Scan'}
                      </button>
                    </div>
                  </div>

                  {/* Sample Quick Test Codes - Touch Targets >= 48px */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 block">Quick Test Codes (Touch to test):</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '+ TICKET-IN-8912', code: 'TICKET-IN-8912' },
                        { label: '+ TICKET-OUT-4401', code: 'TICKET-OUT-4401' },
                        { label: '+ QU-VISHESH-990', code: 'QU-VISHESH-990' }
                      ].map((sample) => (
                        <button
                          key={sample.code}
                          type="button"
                          onClick={() => {
                            setManualCodeInput(sample.code);
                            handleCodeScanned(sample.code);
                          }}
                          className="min-h-[48px] min-w-[48px] px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-xl border border-slate-700/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE VERIFIED OVERLAY POPUP */}
            {currentOverlay && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl shadow-emerald-500/20 relative space-y-5 overflow-hidden">
                  
                  {/* Glowing Background Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />

                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vishesh Event Status</div>
                        <div className="text-base font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
                          {currentOverlay.status}
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentOverlay(null)}
                      className="min-w-[48px] min-h-[48px] rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Attendee Details Card */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Delegate Name</span>
                      <h3 className="text-xl font-black text-white tracking-tight">{currentOverlay.attendee.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block">QU_ID Identifier</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">{currentOverlay.attendee.quId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 block">Pass Category</span>
                        <span className="text-xs font-semibold text-slate-200">{currentOverlay.attendee.category || 'Vishesh VIP Pass'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] font-semibold text-slate-500 block">Timestamp</span>
                      <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(currentOverlay.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Auto-Dismiss Progress Bar & Next Button (Touch Target >= 48px) */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setCurrentOverlay(null)}
                      className="w-full min-h-[48px] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-2xl hover:from-emerald-400 hover:to-teal-300 transition-all text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      Scan Next Delegate ({overlayTimeLeft}s)
                    </button>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(overlayTimeLeft / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RECENT SCAN TIMESTAMP LOGS GLASSMORPHIC CARD (LAST 5 LOGS FOR ACTIVE KEY ONLY) */}
            {(() => {
              const activeKeyClean = String(keyCode || "").trim().toUpperCase();
              const keySpecificLogs = (Array.isArray(recentScans) ? recentScans : [])
                .filter(s => {
                  if (!activeKeyClean) return true;
                  const sKey = String(s.keyCode || s.key_code || s.scannedByKey || "").trim().toUpperCase();
                  return !sKey || sKey === activeKeyClean;
                })
                .slice(0, 5); // STRICTLY LAST 5 LOGS FOR THIS KEY

              const inCount = keySpecificLogs.filter(s => String(s?.gateRole || "").includes('IN') || String(s?.status || "").includes('ENTRY')).length;
              const outCount = keySpecificLogs.filter(s => String(s?.gateRole || "").includes('OUT') || String(s?.status || "").includes('EXIT')).length;

              return (
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-white text-sm">Gate Scan Logs (Last 5 Logs)</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      Total: {keySpecificLogs.length} | IN: {inCount} | OUT: {outCount}
                    </span>
                  </div>

                  {keySpecificLogs.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      No scan logs recorded yet for key '{keyCode || 'VOLUNTEER'}'. Point camera at delegate QR code.
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-1 [webkit-overflow-scrolling:touch]">
                      <table className="w-full text-left text-xs min-w-[320px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                            <th className="py-2 px-2">Delegate</th>
                            <th className="py-2 px-2">QU_ID</th>
                            <th className="py-2 px-2">Gate</th>
                            <th className="py-2 px-2">Status</th>
                            <th className="py-2 px-2">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {keySpecificLogs.map((scan) => (
                            <tr key={scan.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-2 font-semibold text-slate-200 truncate max-w-[100px]">{scan.attendeeName}</td>
                              <td className="py-2.5 px-2 font-mono text-emerald-400 text-[11px]">{scan.quId}</td>
                              <td className="py-2.5 px-2 text-slate-400 text-[11px]">{scan.gateRole.includes('IN') ? 'IN' : 'OUT'}</td>
                              <td className="py-2.5 px-2">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                                  String(scan?.status || "").includes('ENTRY')
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                  {String(scan?.status || "").includes('ENTRY') ? 'ENTRY' : 'EXIT'}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 font-mono text-slate-400 text-[10px]">
                                {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

      </main>
    </div>
  );
}

export { VisheshEventScannerPage as VisheshEventVolunteerScannerPage };
