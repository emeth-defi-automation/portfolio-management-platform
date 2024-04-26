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
      denominator: BigInt(Math.pow(10, fractionArray[1].length)),
    };
  }
  return fractionObject;
};
