require('dotenv').config()
const fs = require('fs')
const yaml = require('js-yaml')
const {executeQuery} = require("../database/neo4j-service");
const {registerUser} = require("../database/data-interface");
const fileData = fs.readFileSync('./yaml/test-data.yaml', 'utf8')
const data = yaml.load(fileData)
const users = data['users']

wipeDatabase()
loadTestData(users)

function wipeDatabase() {
    if (process.env.TEST_LOADING_MODE === "overwrite"){
        console.log("Wiping database");
        executeQuery({}, `MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE r,n`, {})
            .then(() => {
                return
            })
    }
    else{
        return
    }
}

function loadTestData(users) {
    for (const user of users){
        let numLoaded = 0;
        const parameters = {}
        parameters['userInfo'] = user
        try{
            registerUser(parameters)
            numLoaded++
        }
        catch (error) {
            console.error(error);
        }
        console.log("Loaded "+numLoaded+" test users");
    }
    return
}