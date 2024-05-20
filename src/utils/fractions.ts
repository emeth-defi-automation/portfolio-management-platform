/**
 * Converts a numeric string to a fraction object.
 *
 * @param numericString The numeric string to convert to a fraction.
 * @returns An object representing the fraction with properties numerator and denominator.
 * @example
 * // Example usage:
 * const numericString = "3.14159";
 * const fractionObject = convertToFraction(numericString);
 * console.log(fractionObject); // Output: { numerator: 314159, denominator: 100000 }
 */
export type FractionObject = {
  numerator: string;
  denominator: string;
};

export const convertToFraction = (numericString: string) => {
  let fractionObject;
  if (!numericString.includes(".")) {
    fractionObject = {
      numerator: BigInt(numericString),
      denominator: BigInt(1),
    };
  } else {
    const fractionArray = numericString.split(".");
    fractionObject = {
      numerator: BigInt(`${fractionArray[0]}${fractionArray[1]}`),
      denominator: BigInt(10 ** fractionArray[1].length),
    };
  }
  return fractionObject;
};

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

/**
 * Checks if the input string matches the specified regular expression pattern.
 *
 * @param input The string to check against the regular expression.
 * @param regex The regular expression pattern to match against the input string.
 * @returns True if the input string matches the regular expression pattern, otherwise false.
 */

export const checkPattern = (input: string, regex: RegExp) => {
  return regex.test(input);
};
