require('dotenv').config({path: "../.env"})
const config = require('../config');
const fs = require('fs')
const yaml = require('js-yaml')
const {wipeDatabase} = require("../database/neo4j-service");
const {registerUser} = require("../database/data-interface");

//Read user info data
const fileData = fs.readFileSync('../'+config.DATA_FILE, 'utf8')
const data = yaml.load(fileData)
const users = data['users']

databasePrep()
loadTestData(users)
process.exit(0)

function databasePrep() {
    if (config.DATA_LOADING_MODE === "overwrite"){
        console.log("Wiping database");
        wipeDatabase()
    }
}

function loadTestData(users) {
    let numLoaded = 0;
    for (const user of users) {
        const parameters = {}
        parameters['userInfo'] = user
        registerUser(parameters)
        numLoaded++
    }
    console.log(numLoaded+" users loaded")
}