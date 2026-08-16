"use client";

import React from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { config } from "@/lib/puck-config";

/**
 * PuckEditor
 * 
 * Props:
 *   initialData   - Puck JSON data
 *   onSaveBlocks  - async (data) => Promise<boolean> (for Publish)
 *   onChange      - (data) => void (for real-time sync)
 */
export default function PuckEditor({ initialData, onSaveBlocks, onChange }) {
  const [mounted, setMounted] = React.useState(false);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Puck data MUST have a content array and a root object.
  // We handle both empty states and the old ChaiBuilder array format.
  const data = React.useMemo(() => {
    if (!initialData) return { content: [], root: {} };
    if (initialData.content && Array.isArray(initialData.content)) {
      return initialData;
    }
    if (Array.isArray(initialData)) {
      return { content: [], root: {} }; // Clear old incompatible data
    }
    return { content: [], root: {} };
  }, [initialData]);
  
  const onSaveRef = React.useRef(onSaveBlocks);
  onSaveRef.current = onSaveBlocks;

  const handlePublish = async (savedData) => {
    if (typeof onSaveRef.current === "function") {
      try {
        await onSaveRef.current(savedData);
      } catch (e) {
        console.error("PuckEditor: onSaveBlocks failed", e);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-medium">Loading Editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white puck-custom-scroll" suppressHydrationWarning>
      <Puck
        config={config}
        data={data}
        onPublish={handlePublish}
        onChange={(newData) => {
          if (typeof onChangeRef.current === "function") {
            onChangeRef.current(newData);
          }
        }}
        headerTitle="Genesis Page Builder"
      />
      <style jsx global>{`
        .puck-custom-scroll {
          height: 100%;
          overflow: hidden;
        }
        /* Constrain Puck internal layout to parent container */
        .Puck, 
        [class*="_PuckLayout_"], 
        [class*="_PuckLayout-inner_"] {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden;
        }
        /* Ensure the right sidebar is scrollable and within viewport bounds */
        [class*="_Sidebar--right_"] {
          height: auto !important;
          max-height: calc(100vh - 160px) !important; /* Adjusted for admin header offset */
          overflow-y: auto !important;
          padding-bottom: 80px !important; /* Significant padding to ensure bottom settings are clear */
        }
        .Puck-scrollArea {
           height: 100% !important;
        }
        /* Custom overrides for Puck UI to match brand */
        .Puck-button--primary {
           background-color: #6CBD45 !important;
        }
      `}</style>
    </div>
  );
}
