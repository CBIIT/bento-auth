function strToArr(str) {
    try {
        let arr = str.replace(/'/g, '"');
        arr = JSON.parse(arr);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
    }
    return [];
}

module.exports = {
    strToArr
}