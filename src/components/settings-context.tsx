"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/settings-types";
import type { Category } from "@/lib/types";

type Ctx = { settings: Settings; categories: Category[] };
const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsCtx);
  if (!c) throw new Error("useSettings fora do SettingsProvider");
  return c;
}
