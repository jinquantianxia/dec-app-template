// prettier.config.js or .prettierrc.js
module.exports = {
    // Up to 100 characters per line
    printWidth: 100,
    // indent with 4 spaces
    tabWidth: 4,
    // don't use indents, use spaces
    useTabs: false,
    // semicolon required at end of line
    semi: true,
    // use single quotes
    singleQuote: true,
    // object keys are quoted only if necessary
    quoteProps: 'as-needed',
    // jsx does not use single quotes, but double quotes
    jsxSingleQuote: false,
    // no comma required at the end
    trailingComma: 'none',
    // Spaces are required at the beginning and end of the braces
    bracketSpacing: true,
    // The back angle brackets of jsx tags need to wrap
    jsxBracketSameLine: false,
    // Arrow functions, when there is only one parameter, also need parentheses
    arrowParens: 'always',
    // The formatted range for each file is the entire contents of the file
    rangeStart: 0,
    rangeEnd: Infinity,
    // No need to write @prettier at the beginning of the file
    requirePragma: false,
    // no need to automatically insert @prettier at the beginning of the file
    insertPragma: false,
    // use default wrapping standard
    proseWrap: 'preserve',
    // Decide whether html should wrap or not according to the display style
    htmlWhitespaceSensitivity: 'css',
    // newlines use lf
    endOfLine: 'lf'
};
