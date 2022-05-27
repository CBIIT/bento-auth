const path = require('path');

function importPublicHTML(express) {
    return express.static(path.join(__dirname + '/../', 'public'));
}

module.exports = {
    importPublicHTML
};