import plugin from "./plugin.mjs";

export function createScopes({ aliases, clientCanImportAnon }) {
  return [
  {
    name: "scopes/features",
    files: ["src/features/*/{services,loaders,actions,hooks}/*.ts"],
    plugins: { yasainet: plugin },
    rules: {
      "yasainet/scope": ["error", { aliases, clientCanImportAnon }],
    },
  },
];
}
