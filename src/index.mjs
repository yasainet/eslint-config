import base from "./base.mjs";
import directives from "./directives.mjs";
import errors from "./errors.mjs";
import { createImports } from "./imports.mjs";
import { createNaming } from "./naming.mjs";
import { resolveOptions } from "./options.mjs";
import { createScopes } from "./scopes.mjs";
import tailwindcss from "./tailwindcss.mjs";

export function createConfig(options) {
  const resolved = resolveOptions(options);
  return [
    ...base,
    ...(resolved.tailwindcss ? tailwindcss : []),
    ...createNaming(resolved),
    ...createImports(resolved),
    ...directives,
    ...errors,
    ...createScopes(resolved),
  ];
}

export default createConfig();
