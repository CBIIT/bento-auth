function strToArr(str) {
    try {
        let arr = str.replace(/'/g, '"');
        arr = JSON.parse(arr);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        console.error("invalid string array detected")
    }
    return [];
}

module.exports = {
    strToArr
}