module.exports = {
    root: true,
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
    },
    settings: {
        "import/extensions": [".cjs", ".mjs"],
        "import/internal-regex": "^@/",
    },
    rules: {
        indent: "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
    },
    globals: {
        NodeJS: true,
    },
    env: {
        node: true,
        es6: true,
        mocha: true,
    },
}
