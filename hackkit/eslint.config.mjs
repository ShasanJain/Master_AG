import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Accessibility rules — catches a11y issues at compile time
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      // Enforce alt text
      "jsx-a11y/alt-text": "error",
      // Require labels on form elements
      "jsx-a11y/label-has-associated-control": "error",
      // Require aria-label or aria-labelledby on interactive elements
      "jsx-a11y/interactive-supports-focus": "warn",
      // No autofocus (accessibility best practice)
      "jsx-a11y/no-autofocus": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/**",
    "__mocks__/**",
  ]),
]);

export default eslintConfig;
