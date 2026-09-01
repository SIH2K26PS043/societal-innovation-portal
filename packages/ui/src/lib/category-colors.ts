/**
 * Single source of category colors. Charts (M6), badges (all), and the map (M6)
 * MUST import from here so they never disagree. Keys match the Category enum.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  WATER: "#2b8ccc",
  HEALTH: "#e0524e",
  AGRICULTURE: "#5aa02c",
  EDUCATION: "#0b3d91",
  ENVIRONMENT: "#2e7d5b",
  ENERGY: "#f5a623",
  URBAN: "#7b61ff",
  ACCESSIBILITY: "#00a3a3",
  GOVERNANCE: "#8a6d3b",
  RURAL_LIVELIHOOD: "#b5651d",
  SANITATION: "#6d9dc5",
  INFRASTRUCTURE: "#616161",
  OTHER: "#8a94a6",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.OTHER!;
}
