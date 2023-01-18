
function mergeCode(justClassCode, int_Main_code) {
    var newFullCode = "";
    const targetWord = "int main";
    var index = 0;
    var currrentWord = int_Main_code.substring(index, index + 8);

    console.log(targetWord, " -- ", currrentWord)
    while (currrentWord != targetWord) {
        index++;
        currrentWord = int_Main_code.substring(index, index + 8)
    }

    const firstPart = int_Main_code.substring(0, index)
    const secondPart = justClassCode
    const thirdPart = int_Main_code.substring(index)

    return firstPart + secondPart + thirdPart
}

module.exports = { mergeCode }

