import antfu from "@antfu/eslint-config";
import nextPlugin from "@next/eslint-plugin-next";
import tailwind from "eslint-plugin-tailwindcss";

export default antfu(
  {
    type: "app",
    formatters: true,
    react: true,
    typescript: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
    ignores: [
      "**/.next",
      "**/next-env.d.ts",
      "**/src/migrations/*",
      "**/src/components/ui/*",
      "**/src/server/actions/sts/invioSincrono/*",
    ],
  },
  // Tailwind
  ...tailwind.configs["flat/recommended"],
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    rules: {
      "tailwindcss/no-custom-classname": ["off"],
      "style/multiline-ternary": ["off"],
      "node/prefer-global/buffer": ["off"],
      "unused-imports/no-unused-vars": ["off"],
      "react/prefer-destructuring-assignment": ["off"],
      "react-refresh/only-export-components": ["off"],
      "no-console": ["error"],
      "style/no-tabs": ["off"],
      "antfu/no-top-level-await": ["off"],
      "node/prefer-global/process": ["off"],
      "node/no-process-env": ["error"],
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["README.md"],
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          internalPattern: ["^@/.*", "^~/.*"],
          type: "natural",
          groups: [
            "node",
            "react",
            "type",
            ["builtin", "external"],
            "internal-type",
            "internal",
            ["parent-type", "sibling-type", "index-type"],
            ["parent", "sibling", "index"],
            "object",
            "unknown",
          ],
          customGroups: {
            value: {
              node: ["^node$", "^node:.*"],
              react: ["^react$", "^react-.*"],
            },
            type: {
              node: ["^node$", "^node:.*"],
              react: ["^react$", "^react-.*"],
            },
          },
        },
      ],
    },
  }
);
