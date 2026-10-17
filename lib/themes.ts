import type { CSSProperties } from "react"

export type SurveyTheme = {
  id: string
  name: string
  brand: string
  brandDark: string
  accent: string
  bg: string
  cardBg: string
  text: string
  muted: string
  border: string
  field: string
  danger: string
  scheme: "light" | "dark"
}

export const THEMES = {
  institucional: {
    id: "institucional", name: "Azul Institucional",
    brand: "#1B2A4A", brandDark: "#14213D", accent: "#B98A2F",
    bg: "#FAF7EF", cardBg: "#FFFFFF", text: "#201C16",
    muted: "#5B5646", border: "#E7E0D2", field: "#FDFCF8", danger: "#B54B3B", scheme: "light",
  },
  esmeralda: {
    id: "esmeralda", name: "Esmeralda",
    brand: "#047857", brandDark: "#065F46", accent: "#D97706",
    bg: "#F0FDF4", cardBg: "#FFFFFF", text: "#14231B",
    muted: "#4B5E54", border: "#D1E7DB", field: "#F8FDFA", danger: "#B54B3B", scheme: "light",
  },
  purpura: {
    id: "purpura", name: "Púrpura",
    brand: "#6D28D9", brandDark: "#5B21B6", accent: "#DB2777",
    bg: "#F7F5FF", cardBg: "#FFFFFF", text: "#1E1633",
    muted: "#5E5675", border: "#E3DDF5", field: "#FBFAFF", danger: "#B54B3B", scheme: "light",
  },
  menta: {
    id: "menta", name: "Menta",
    brand: "#0F766E", brandDark: "#115E59", accent: "#F59E0B",
    bg: "#F0FDFA", cardBg: "#FFFFFF", text: "#12302D",
    muted: "#4A6461", border: "#CCEAE5", field: "#F7FDFC", danger: "#B54B3B", scheme: "light",
  },
  oscuro: {
    id: "oscuro", name: "Modo Oscuro",
    brand: "#2563EB", brandDark: "#1D4ED8", accent: "#FBBF24",
    bg: "#0F172A", cardBg: "#1E293B", text: "#E2E8F0",
    muted: "#94A3B8", border: "#334155", field: "#0F172A", danger: "#F87171", scheme: "dark",
  },
} satisfies Record<string, SurveyTheme>

export type ThemeId = keyof typeof THEMES
export const DEFAULT_THEME_ID: ThemeId = "institucional"

export function isThemeId(id: unknown): id is ThemeId {
  return typeof id === "string" && Object.hasOwn(THEMES, id)
}

export function getTheme(id?: string | null): SurveyTheme {
  return isThemeId(id) ? THEMES[id] : THEMES[DEFAULT_THEME_ID]
}

export function themeStyle(t: SurveyTheme): CSSProperties {
  return {
    "--color-brand": t.brand,
    "--color-brand-dark": t.brandDark,
    "--bg-survey": t.bg,
    "--bg-card": t.cardBg,
    "--color-ink": t.text,
    "--color-muted": t.muted,
    "--color-line": t.border,
    "--color-field": t.field,
    "--color-accent": t.accent,
    "--color-danger": t.danger,
    colorScheme: t.scheme,
  } as CSSProperties
}