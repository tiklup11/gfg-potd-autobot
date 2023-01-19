const targetWord = "//Position this line where user code will be pasted."
const targetLen = targetWord.length;

function mergeCode(justClassCode, int_Main_code) {
    var newFullCode = "";
    var index = 0;
    var currrentWord = int_Main_code.substring(index, index + targetLen);

    while (currrentWord != targetWord) {
        index++;
        currrentWord = int_Main_code.substring(index, index + targetLen)
    }

    const firstPart = int_Main_code.substring(0, index)
    const secondPart = justClassCode
    const thirdPart = int_Main_code.substring(index)

    return firstPart + secondPart + thirdPart
}

module.exports = { mergeCode }

