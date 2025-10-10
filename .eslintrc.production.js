module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable strict rules for production build
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-empty-object-type": "off",
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "*.config.js",
    "*.config.ts",
  ],
};
