const targetWord = "//Position this line where user code will be pasted.";
const mainFunctionPattern = /\bint\s+main\s*\(/;

function mergeCode(solutionCode, driverCode) {
  const markerIndex = driverCode.indexOf(targetWord);
  if (markerIndex !== -1) {
    return insertCodeAt(solutionCode, driverCode, markerIndex);
  }

  const mainFunction = mainFunctionPattern.exec(driverCode);
  if (!mainFunction) {
    throw new Error(
      "GFG starter code did not contain the user-code marker or main function",
    );
  }

  return insertCodeAt(solutionCode, driverCode, mainFunction.index);
}

function insertCodeAt(solutionCode, driverCode, index) {
  const firstPart = driverCode.substring(0, index);
  const thirdPart = driverCode.substring(index);

  return firstPart + solutionCode + thirdPart;
}

module.exports = { mergeCode };
