import { transform } from "buble-jsx-only";

const transpile = (text: string) =>
    transform(text, {
        objectAssign: "Object.assign",
        transforms: {
            computedProperty: false,
            conciseMethodProperty: false,
        },
    }).code;

const removeTrailing = (line: string) => line.replace(/;$/, "").trim();

/**
 * Replace every succession of white spaces by one space except new line
 * @param {string} text
 * @returns {string}
 */
const removeExtraWhiteSpaces = (text: string) =>
    removeTrailing(text.replace(/[^\S\r\n]+/g, " ").trim());

export const parseExportStatement = (text: string) => {
    const textWithoutWhiteSpaces = removeExtraWhiteSpaces(text);
    if (!textWithoutWhiteSpaces.startsWith("export const")) {
        return undefined;
    }
    const statement = textWithoutWhiteSpaces.replace("export const ", "");
    const [name] = statement.split("=");
    try {
        return { name: name.trim(), value: transpile(`const ${statement}`) };
    } catch (error) {
        return undefined;
    }
};
