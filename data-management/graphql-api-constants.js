exports.valid_idps = valid_idps = ["google", "nih", "login.gov"];

exports.errorName = {
    MISSING_INPUTS: "MISSING_INPUTS",
    INVALID_IDP: "INVALID_IDP",
    NOT_LOGGED_IN: "NOT_LOGGED_IN",
    NOT_AUTHORIZED: "NOT_AUTHORIZED",
    NOT_UNIQUE: "NOT_UNIQUE",
};

exports.errorType = {
    MISSING_INPUTS: {
        message: "Inputs for email and IDP are required inputs for registration",
        statusCode: 400
    },
    INVALID_IDP: {
        message: "Invalid IDP, the valid IDPs are the following: "+valid_idps.join(", "),
        statusCode: 400
    },
    NOT_LOGGED_IN: {
        message: "User is either not logged in or not yet registered",
        statusCode: 401
    },
    NOT_AUTHORIZED: {
        message: "Not authorized",
        statusCode: 403
    },
    NOT_UNIQUE: {
        message: "The provided email and IDP combination is already registered",
        statusCode: 409
    },
};