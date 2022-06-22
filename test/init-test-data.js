const config = require('../config');
const fs = require('fs')
const yaml = require('js-yaml')
const {wipeDatabase} = require("../data-management/neo4j-service");
const {registerUser} = require("../data-management/data-interface");

//Read user info data
const fileData = fs.readFileSync(config.DATA_FILE, 'utf8')
const data = yaml.load(fileData)
const users = data['users']

loadTestData(users).then(r => process.exit(0))

async function loadTestData(users) {
    if (config.DATA_LOADING_MODE === "overwrite") {
        console.log("Wiping database");
        await wipeDatabase()
    }
    let numLoaded = 0;
    for (const user of users) {
        const parameters = {}
        parameters['userInfo'] = user
        console.log(await registerUser(parameters))
        numLoaded++
    }
    console.log(numLoaded + " users loaded")
}