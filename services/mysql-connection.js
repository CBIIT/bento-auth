const mysql = require('mysql');
const config = require('../config.js');

const connection = mysql.createPool({
    host: config.mysql_host,
    user: config.mysql_user,
    password: config.mysql_password,
    database: config.mysql_database,
});

const getTTL = (req, res) => {
    connection.getConnection(async function (err, currentConnection) {
        const sessionID = getSessionIDFromCookie(req, res);
        if (err) {
            console.log(err);
            let response = createTTLErrorResponse("Could not establish a connection to the session database, see logs for details");
            res.json(response);
            return;
        }
        else if (sessionID){
            connection.query("select expires from sessions where session_id=?", sessionID, (err, rows) => {
                let response;
                if (err){
                    console.log(err);
                    response = createTTLErrorResponse("An error occurred while querying the database, see logs for details");
                }
                else if (!rows || !rows[0] || !rows[0].expires){
                    response = createTTLResponse(0);
                }
                else{
                    let expires = rows[0].expires;
                    let dt = new Date(expires * 1000);
                    let ttl = Math.round((dt.valueOf() - Date.now())/1000);
                    response = createTTLResponse(ttl);
                }
                res.json(response);
            });
        }
        currentConnection.release();
    });
}

function createTTLResponse(ttl){
    return createTTLResponse(ttl, null);
}

function createTTLErrorResponse(error){
    return createTTLResponse(null, error);
}

function createTTLResponse(ttl, error){
    const response = {ttl: ttl};
    if (error){
        response.error = error;
    }
    return response;
}

function getSessionIDFromCookie(req, res){
    if (!req || !req.cookies || !req.cookies["connect.sid"]){
        const response = createTTLResponse(0);
        res.json(response);
        return null;
    }
    else{
        return req.cookies["connect.sid"].match(':.*[.]')[0].slice(1,-1);
    }
}

exports.getTTL = getTTL;