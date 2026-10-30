// Line icons: stroke-only on a 24x24 grid, geometry derived from Lucide
// (https://lucide.dev, ISC license, see THIRD_PARTY.md). A missing icon goes in
// EXTRA_ICONS (Icon.tsx), drawn in the same style.
export const ICONS: Record<string, { viewBox: string; body: string }> = {
  "cpu": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><path d=\"M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2\"/>"
  },
  "sparkles": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 3l1.9 5.6a2 2 0 0 0 1.5 1.5L21 12l-5.6 1.9a2 2 0 0 0-1.5 1.5L12 21l-1.9-5.6a2 2 0 0 0-1.5-1.5L3 12l5.6-1.9a2 2 0 0 0 1.5-1.5z\"/><path d=\"M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3\"/>"
  },
  "workflow": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><path d=\"M6.5 10v4a2 2 0 0 0 2 2H14\"/>"
  },
  "layers": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 2 2 7l10 5 10-5z\"/><path d=\"m2 12 10 5 10-5\"/><path d=\"m2 17 10 5 10-5\"/>"
  },
  "box": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><path d=\"m3.3 7 8.7 5 8.7-5M12 22V12\"/>"
  },
  "repeat": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m17 2 4 4-4 4\"/><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\"/><path d=\"m7 22-4-4 4-4\"/><path d=\"M21 13v1a4 4 0 0 1-4 4H3\"/>"
  },
  "arrow-right": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14M12 5l7 7-7 7\"/>"
  },
  "git-branch": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M6 3v12\"/><circle cx=\"18\" cy=\"6\" r=\"3\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><path d=\"M18 9a9 9 0 0 1-9 9\"/>"
  },
  "split": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 3h5v5M8 3H3v5M21 3l-7.5 7.5M3 3l7.5 7.5M12 12v9\"/>"
  },
  "database": {
    "viewBox": "0 0 24 24",
    "body": "<ellipse cx=\"12\" cy=\"5\" rx=\"9\" ry=\"3\"/><path d=\"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5\"/><path d=\"M3 12c0 1.66 4 3 9 3s9-1.34 9-3\"/>"
  },
  "file-text": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z\"/><path d=\"M14 2v5h5M16 13H8M16 17H8M10 9H8\"/>"
  },
  "bar-chart": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"M7 16v-4M12 16V8M17 16v-6\"/>"
  },
  "trending-up": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 7h6v6\"/><path d=\"m22 7-8.5 8.5-5-5L2 17\"/>"
  },
  "link": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>"
  },
  "plug": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 22v-5M9 8V2M15 8V2\"/><path d=\"M18 8v3a6 6 0 0 1-12 0V8z\"/>"
  },
  "globe": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>"
  },
  "terminal": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m4 17 6-6-6-6M12 19h8\"/>"
  },
  "code": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m16 18 6-6-6-6M8 6l-6 6 6 6\"/>"
  },
  "building": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M9 22v-4h6v4\"/><path d=\"M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01\"/>"
  },
  "users": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75\"/>"
  },
  "dollar": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 2v20\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/>"
  },
  "credit-card": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"/><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"/>"
  },
  "mail": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>"
  },
  "message": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M22 17a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/>"
  },
  "bot": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 8V4H8\"/><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"/><path d=\"M2 14h2\"/><path d=\"M20 14h2\"/><path d=\"M15 13v2\"/><path d=\"M9 13v2\"/>"
  },
  "check": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M20 6 9 17l-5-5\"/>"
  },
  "x": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M18 6 6 18M6 6l12 12\"/>"
  },
  "alert": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z\"/><path d=\"M12 9v4M12 17h.01\"/>"
  },
  "help": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><path d=\"M12 17h.01\"/>"
  },
  "clock": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>"
  },
  "lock": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>"
  },
  "zap": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M13 2 4 14h7l-1 8 9-12h-7z\"/>"
  },
  "target": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>"
  },
  "search": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>"
  },
  "eye": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>"
  },
  "settings": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6\"/>"
  }
};
