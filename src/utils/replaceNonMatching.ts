/**
 * Replaces characters in a string that do not match a specified regular expression pattern.
 *
 * @param inputString The input string to perform the replacement on.
 * @param regex The regular expression pattern used to match characters to be replaced.
 * @param replacement The string used to replace characters that do not match the regular expression pattern.
 * @returns A new string with characters replaced based on the specified regular expression pattern.
 * @example
 * // Example usage:
 * const inputString = "abc123def456ghi";
 * const regex = /\d+/; // Match any sequence of digits
 * const replacement = "*";
 * const result = replaceNonMatching(inputString, regex, replacement);
 * console.log(result); // Output: "***123***456***"
 */
export function replaceNonMatching(
  inputString: string,
  regex: RegExp,
  replacement: string,
): string {
  return inputString.replace(
    new RegExp(`[^${regex.source}]`, "g"),
    replacement,
  );
}
