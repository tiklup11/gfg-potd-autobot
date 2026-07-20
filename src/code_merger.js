const targetWord = "//Position this line where user code will be pasted.";

function mergeCode(solutionCode, driverCode) {
  const index = driverCode.indexOf(targetWord);
  if (index === -1) {
    throw new Error("GFG starter code did not contain the user-code marker");
  }

  const firstPart = driverCode.substring(0, index);
  const thirdPart = driverCode.substring(index);

  return firstPart + solutionCode + thirdPart;
}

module.exports = { mergeCode };

