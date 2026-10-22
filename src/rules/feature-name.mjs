import fs from "fs";
import path from "path";

const FEATURES_DIR = "/src/features/";
const TYPES_PATH = "src/lib/supabase/types.ts";

const cache = new Map();

function extractTableNames(content) {
  const publicMatch = /(?<!\w)public:\s*\{/.exec(content);
  if (!publicMatch) return [];

  const tablesIdx = content.indexOf("Tables:", publicMatch.index);
  if (tablesIdx === -1) return [];

  const start = content.indexOf("{", tablesIdx);
  if (start === -1) return [];

  const names = [];
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    } else if (depth === 1) {
      const match = /^(\w+)\s*:/.exec(content.slice(i, i + 80));
      if (match && !/\w/.test(content[i - 1])) {
        names.push(match[1]);
        i += match[0].length - 1;
      }
    }
  }
  return names;
}

function readTableNames(typesPath) {
  if (!fs.existsSync(typesPath)) return [];

  const { mtimeMs } = fs.statSync(typesPath);
  const cached = cache.get(typesPath);
  if (cached && cached.mtimeMs === mtimeMs) return cached.names;

  const names = extractTableNames(fs.readFileSync(typesPath, "utf-8"));
  cache.set(typesPath, { mtimeMs, names });
  return names;
}

export default {
  meta: {
    type: "problem",
    messages: {
      invalidFeatureName:
        "features cannot use the name '{{ name }}'. It can use only a Supabase table name or auth ({{ allowed }}).",
    },
    schema: [
      {
        type: "object",
        properties: { typesPath: { type: "string" } },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const filename = context.filename;
    const idx = filename.indexOf(FEATURES_DIR);
    if (idx === -1) return {};

    const name = filename.slice(idx + FEATURES_DIR.length).split("/")[0];
    // monorepo では型 file が別 package (core) にあるので、cwd 相対で指定できる
    const option = context.options[0]?.typesPath;
    const typesPath =
      option === undefined
        ? path.join(filename.slice(0, idx), TYPES_PATH)
        : path.resolve(context.cwd, option);

    const allowed = [
      "auth",
      ...readTableNames(typesPath).map((table) => table.replace(/_/g, "-")),
    ];
    if (allowed.includes(name)) return {};

    return {
      Program: (node) =>
        context.report({
          node,
          messageId: "invalidFeatureName",
          data: { name, allowed: allowed.join(", ") },
        }),
    };
  },
};
