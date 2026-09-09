export const themeColors = {
  primary: [
    "#eff0fe",
    "#dfe1fa",
    "#bdc2f3",
    "#99a1ed",
    "#7a84e8",
    "#6570e5",
    "#5965e4",
    "#4a55cc",
    "#404bb6",
    "#3541a0" // Base shade at index 7? Mantine needs 10 shades. 
    // We will map Mantine's theme primary color. The actual accent is #6366F1
  ] as const,
  // Let's use mantine standard tuple type
};

// Based on wireframe: --primary-accent: #6366F1
// This corresponds to a deep indigo.
// We will define it fully in theme.ts using Mantine's generateColors or specific shades.
