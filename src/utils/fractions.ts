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

export const chekckIfProperAmount = (input: string, regex: RegExp) => {
    return regex.test(input);
};