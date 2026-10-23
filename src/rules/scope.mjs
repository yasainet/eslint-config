import { DEFAULT_ALIASES, stripAlias } from "../options.mjs";

const FILE_PATTERN =
  /\/src\/features\/[^/]+\/(services|loaders|actions|hooks)\/([^/]+)\.ts$/;
const IMPORT_PATTERN =
  /^features\/[^/]+\/(queries|services|loaders|actions)\/([^/]+)$/;
const SCOPES = ["server", "client", "admin", "anon"];

function toScope(name) {
  return name === "client" || name === "admin" || name === "anon"
    ? name
    : "server";
}

export default {
  meta: {
    type: "problem",
    messages: {
      invalidFileName:
        "{{ layer }} cannot use the file name '{{ name }}'. It can use only server, client, admin or anon.",
      mixed:
        "{{ importer }} cannot import '{{ importPath }}'. A browser file (client) can import only client and anon. A server file cannot import client.",
      adminOnly:
        "{{ importer }} cannot import '{{ importPath }}'. Only admin.ts can import admin.",
      anonOnly:
        "{{ importer }} cannot import '{{ importPath }}'. anon.ts can import only anon. A public (anon) file cannot read cookies or use admin.",
    },
    schema: [
      {
        type: "object",
        properties: {
          aliases: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const aliases = context.options[0]?.aliases ?? DEFAULT_ALIASES;
    const fileMatch = FILE_PATTERN.exec(context.filename);
    if (!fileMatch) return {};

    const [, layer, name] = fileMatch;
    const isHooks = layer === "hooks";
    const importer = isHooks ? "hooks" : `${layer}/${name}.ts`;

    if (!isHooks && !SCOPES.includes(name)) {
      return {
        Program: (node) =>
          context.report({
            node,
            messageId: "invalidFileName",
            data: { layer, name },
          }),
      };
    }

    const scope = isHooks ? "client" : name;

    function check(source) {
      if (!source || typeof source.value !== "string") return;
      const importPath = source.value;

      const rest = stripAlias(importPath, aliases);
      if (rest === null) return;
      const importMatch = IMPORT_PATTERN.exec(rest);
      if (!importMatch) return;

      const [, importedLayer, importedName] = importMatch;
      if (isHooks && importedLayer === "actions") return;

      const importedScope = toScope(importedName);
      const data = { importer, importPath };

      // client は client と anon を import できる。anon は secret も cookie も持たない公開の読み取りで、
      // browser や app (React Native) で動かしても漏れるものが無い
      const importedIsClientSafe =
        importedScope === "client" || importedScope === "anon";
      if (scope === "client" ? !importedIsClientSafe : importedScope === "client") {
        context.report({ node: source, messageId: "mixed", data });
      } else if (scope === "anon" && importedScope !== "anon") {
        context.report({ node: source, messageId: "anonOnly", data });
      } else if (scope === "server" && importedScope === "admin") {
        context.report({ node: source, messageId: "adminOnly", data });
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
