/**
 * Checks if the input string matches the specified regular expression pattern.
 * 
 * @param input The string to check against the regular expression.
 * @param regex The regular expression pattern to match against the input string.
 * @returns True if the input string matches the regular expression pattern, otherwise false.
 */
export const checkIfStringMatchesPattern = (input: string, regex: RegExp) => {
    return regex.test(input);
};
