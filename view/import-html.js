const path = require('path');

function importHTML(express) {
    return express.static(path.join(__dirname + '/../', 'public'));
}

module.exports = {
    importHTML
};