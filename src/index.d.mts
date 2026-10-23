import type { Linter } from "eslint";

export interface Options {
  /** import の root として扱う prefix。default は ["@/"] */
  aliases?: string[];
  /** feature 名の元になる Supabase の型 file。cwd 相対。default は <root>/src/lib/supabase/types.ts */
  typesPath?: string;
  /** false で tailwind の rule を外す。default は true */
  tailwindcss?: boolean;
  /** true で client の file が anon を import できる。server を持たない app 用。default は false */
  clientCanImportAnon?: boolean;
}

export declare function createConfig(options?: Options): Linter.Config[];

declare const config: Linter.Config[];
export default config;
