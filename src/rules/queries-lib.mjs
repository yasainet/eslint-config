import fs from "fs";
import path from "path";

const FEATURES_DIR = "/src/features/";
const LIB_DIR = "src/lib";
const SUPABASE_NAMES = ["server", "client", "admin", "anon"];

function readLibMapping(libDir) {
  const mapping = {};
  if (!fs.existsSync(libDir)) return mapping;

  for (const entry of fs.readdirSync(libDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    if (entry.name === "supabase") {
      for (const name of SUPABASE_NAMES) {
        if (fs.existsSync(path.join(libDir, "supabase", `${name}.ts`))) {
          mapping[name] = `@/lib/supabase/${name}`;
        }
      }
    } else if (fs.existsSync(path.join(libDir, entry.name, "index.ts"))) {
      mapping[entry.name] = `@/lib/${entry.name}`;
    }
  }
  return mapping;
}

export default {
  meta: {
    type: "problem",
    messages: {
      invalidFileName:
        "queries cannot use the file name '{{ name }}'. It can use only a name from src/lib ({{ allowed }}).",
      invalidLibImport:
        "queries/{{ name }}.ts can import only {{ expected }}. It cannot import '{{ importPath }}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename;
    const idx = filename.indexOf(FEATURES_DIR);
    if (idx === -1) return {};

    const mapping = readLibMapping(path.join(filename.slice(0, idx), LIB_DIR));
    const name = path.basename(filename, ".ts");
    const expected = mapping[name];

    if (!expected) {
      return {
        Program: (node) =>
          context.report({
            node,
            messageId: "invalidFileName",
            data: { name, allowed: Object.keys(mapping).sort().join(", ") },
          }),
      };
    }

    function check(source) {
      if (!source || typeof source.value !== "string") return;
      const importPath = source.value;

      if (importPath.startsWith("@/lib/") && importPath !== expected) {
        context.report({
          node: source,
          messageId: "invalidLibImport",
          data: { name, expected, importPath },
        });
      }
    }

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
    };
  },
};
