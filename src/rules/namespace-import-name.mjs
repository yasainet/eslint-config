import { DEFAULT_ALIASES, stripAlias } from "../options.mjs";

const FEATURES_PREFIX = "features/";

function toCamelCase(rest) {
  return rest
    .slice(FEATURES_PREFIX.length)
    .split(/[/-]/)
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

export default {
  meta: {
    type: "problem",
    messages: {
      mismatch:
        "namespace import cannot use the name '{{ actual }}'. It can use only '{{ expected }}' (from '{{ importPath }}').",
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
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== "string") return;
        const rest = stripAlias(importPath, aliases);
        if (rest === null || !rest.startsWith(FEATURES_PREFIX)) return;

        const specifier = node.specifiers.find(
          (s) => s.type === "ImportNamespaceSpecifier",
        );
        if (!specifier) return;

        const expected = toCamelCase(rest);
        const actual = specifier.local.name;

        if (actual !== expected) {
          context.report({
            node: specifier,
            messageId: "mismatch",
            data: { actual, expected, importPath },
          });
        }
      },
    };
  },
};
