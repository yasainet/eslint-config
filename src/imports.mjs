import { aliasPrefix } from "./options.mjs";
import plugin from "./plugin.mjs";

const feature = (...layers) => `features/[^/]+/(?:${layers.join("|")})/`;

export function createImports({ aliases }) {
  const allow = (...paths) => `^${aliasPrefix(aliases)}(?!${paths.join("|")})`;

  return [
  {
    name: "imports/path",
    files: ["src/**/*.{ts,tsx}"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/no-parent-import": "error",
      "yasainet/namespace-import-name": ["error", { aliases }],
    },
  },
  {
    name: "imports/lib",
    files: ["src/lib/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow("configs/", feature("configs")),
              message:
                "lib can import only ./ (same folder) and configs. lib cannot import other @/.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/utils",
    files: ["src/utils/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow("configs/", feature("configs")),
              message:
                "utils can import only ./ (same folder) and configs. utils cannot import other @/.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/queries",
    files: ["src/features/*/queries/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/queries-lib": ["error", { aliases }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow("lib/", feature("types")),
              message:
                "queries can import only @/lib and types. queries cannot import other layers. services pass values such as configs to queries as arguments.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/services",
    files: ["src/features/*/services/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "utils/",
                "configs/",
                feature("queries", "schemas", "types", "configs", "utils"),
              ),
              message:
                "services can import only queries, schemas, types, @/utils, configs and feature utils. services cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/loaders",
    files: ["src/features/*/loaders/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "configs/",
                feature("services", "configs", "types", "utils"),
              ),
              message:
                "loaders can import only services, configs, types and feature utils. loaders cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/actions",
    files: ["src/features/*/actions/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "configs/",
                feature("services", "configs", "types", "utils"),
              ),
              message:
                "actions can import only services, configs, types and feature utils. actions cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/hooks",
    files: ["src/features/*/hooks/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "components/ui/",
                "configs/",
                feature("actions", "loaders", "types", "configs", "utils"),
              ),
              message:
                "hooks can import only @/components/ui, actions, loaders, types, configs and feature utils. hooks cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/feature-components",
    files: ["src/features/*/components/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "components/",
                "configs/",
                feature("hooks", "configs", "types", "utils"),
              ),
              message:
                "feature components can import only @/components, hooks, configs, types and feature utils. feature components cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/app",
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "components/",
                "utils/",
                "configs/",
                feature("components", "loaders", "configs", "types", "utils"),
              ),
              message:
                "app can import only @/components, @/utils, feature components, loaders, configs, types and feature utils. app cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/configs",
    files: ["src/configs/*.ts", "src/features/*/configs/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(feature("types")),
              message:
                "configs can import only types. configs cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/schemas",
    files: ["src/features/*/schemas/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow("configs/", feature("configs")),
              message:
                "schemas can import only external packages and configs. schemas cannot import other @/.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/feature-utils",
    files: ["src/features/*/utils/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "utils/",
                "configs/",
                feature("configs", "types", "utils"),
              ),
              message:
                "feature utils can import only @/utils, configs, types and feature utils. feature utils cannot import other layers.",
            },
          ],
        },
      ],
    },
  },
  {
    name: "imports/types",
    files: ["src/features/*/types/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: allow(
                "lib/[^/]+/(?:types|database)$",
                "utils/mapping$",
                "configs/",
                feature("configs", "types"),
              ),
              message:
                "types can import only @/lib/*/types, @/lib/*/database, @/utils/mapping, configs and types.",
            },
          ],
        },
      ],
    },
  },
];
}
