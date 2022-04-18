module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        node: true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "quotes": 2,
        "no-debugger": 0,
        "@typescript-eslint/no-empty-interface":0,
        "@typescript-eslint/no-explicit-any":0,
    }
}
