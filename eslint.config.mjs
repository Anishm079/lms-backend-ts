import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint, { plugin } from "typescript-eslint";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins:{
      plugin
    }
  },
];