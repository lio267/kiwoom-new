import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

const jsRules = js.configs.recommended.rules ?? {};
const reactRules = reactPlugin.configs.recommended?.rules ?? {};
const importRules = importPlugin.configs.recommended?.rules ?? {};

const sharedConfig = {
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    }
  },
  plugins: {
    "@typescript-eslint": tseslint,
    react: reactPlugin,
    "react-hooks": reactHooksPlugin,
    import: importPlugin
  },
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      },
      typescript: {
        project: ["tsconfig.json"]
      }
    }
  },
  rules: {
    ...jsRules,
    ...reactRules,
    ...importRules,
    "no-undef": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/order": [
      "warn",
      {
        groups: [
          ["builtin"],
          ["external"],
          ["internal"],
          ["parent", "sibling", "index"]
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true
        }
      }
    ]
  }
};

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "public/**"
    ]
  },
  {
    ...sharedConfig,
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ...sharedConfig.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    }
  },
  {
    ...sharedConfig,
    files: [
      "server/**/*.{ts,tsx,js,jsx}",
      "*.config.ts",
      "vite.config.ts",
      "tailwind.config.ts"
    ],
    languageOptions: {
      ...sharedConfig.languageOptions,
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      ...sharedConfig.rules,
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
];
