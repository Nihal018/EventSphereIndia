export const Fonts = {
  // Font families
  primary: "Inter_400Regular",
  primaryMedium: "Inter_500Medium",
  primaryBold: "Inter_700Bold",
  secondary: "Poppins_400Regular",
  secondaryMedium: "Poppins_500Medium",
  secondaryBold: "Poppins_700Bold",

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    heading: 32,
    title: 36,
    hero: 42,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Typography styles
export const Typography = {
  hero: {
    fontSize: Fonts.sizes.hero,
    fontFamily: Fonts.secondaryBold,
    lineHeight: Fonts.sizes.hero * Fonts.lineHeights.tight,
    letterSpacing: Fonts.letterSpacing.tight,
  },

  title: {
    fontSize: Fonts.sizes.title,
    fontFamily: Fonts.secondaryBold,
    lineHeight: Fonts.sizes.title * Fonts.lineHeights.tight,
  },

  heading: {
    fontSize: Fonts.sizes.heading,
    fontFamily: Fonts.secondaryBold,
    lineHeight: Fonts.sizes.heading * Fonts.lineHeights.normal,
  },

  subheading: {
    fontSize: Fonts.sizes.xxl,
    fontFamily: Fonts.secondaryMedium,
    lineHeight: Fonts.sizes.xxl * Fonts.lineHeights.normal,
  },

  body: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.primary,
    lineHeight: Fonts.sizes.md * Fonts.lineHeights.relaxed,
  },

  bodyMedium: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.primaryMedium,
    lineHeight: Fonts.sizes.md * Fonts.lineHeights.relaxed,
  },

  caption: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.primary,
    lineHeight: Fonts.sizes.sm * Fonts.lineHeights.normal,
  },

  button: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.primaryMedium,
    lineHeight: Fonts.sizes.md * Fonts.lineHeights.tight,
    letterSpacing: Fonts.letterSpacing.wide,
  },

  overline: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.primaryMedium,
    lineHeight: Fonts.sizes.xs * Fonts.lineHeights.normal,
    letterSpacing: Fonts.letterSpacing.wider,
    textTransform: "uppercase" as const,
  },
};
