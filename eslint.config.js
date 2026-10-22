import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    // TypeScript 自己会做未定义变量检查；no-undef 无法识别类型名与编译期常量
    files: ["**/*.{ts,vue}"],
    rules: { "no-undef": "off" },
  },
  {
    // 这些全局由 index.html 在加载 pj_public.js 前注入
    files: ["public/pj_public.js"],
    languageOptions: {
      globals: {
        mainJs: "readonly",
        cssResources: "readonly",
        jsResources: "readonly",
        pjJsResources: "readonly",
      },
    },
  },
  // 关闭与 Prettier 冲突的排版规则；格式检查使用 pnpm format:check
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "vue/multi-word-component-names": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/generated/**",
      "src/auto-imports.d.ts",
      "src/components.d.ts",
    ],
  },
];
