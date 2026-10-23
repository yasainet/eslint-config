/**
 * createConfig の option。default は 1 package の Next.js project (alias は @/ だけ)。
 *
 * - aliases: import の root として扱う prefix。monorepo で `@anglers/core/` のような
 *   workspace package を `@/` と同じ層の rule で見るときに足す
 * - typesPath: feature 名の元になる Supabase の型 file。cwd 相対。
 *   省略時は file から見た `<root>/src/lib/supabase/types.ts`
 * - tailwindcss: false で tailwind の rule を外す (globals.css が無い package)
 * - clientCanImportAnon: true で client の file が anon を import できる。server を持たない app (React Native) 用。
 *   Next.js の project は既定 (false) のまま、公開 data も server の loaders を通す
 */
export const DEFAULT_ALIASES = ["@/"];

export function resolveOptions(options = {}) {
  return {
    aliases: options.aliases ?? DEFAULT_ALIASES,
    typesPath: options.typesPath,
    tailwindcss: options.tailwindcss ?? true,
    clientCanImportAnon: options.clientCanImportAnon ?? false,
  };
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `^(?:@/|@anglers/core/)` のように alias のどれかで始まる import に match する prefix */
export function aliasPrefix(aliases) {
  return `(?:${aliases.map(escapeRegExp).join("|")})`;
}

/** import path が alias で始まれば、alias を除いた残りを返す */
export function stripAlias(importPath, aliases) {
  const alias = aliases.find((a) => importPath.startsWith(a));
  return alias === undefined ? null : importPath.slice(alias.length);
}
