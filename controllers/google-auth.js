// exports.login = async (req, res, next) => {
//     try {
//         const code = req.body['code'];
//         const { name, tokens } = await idpClient.login(code);
//         req.session.tokens = tokens;
//         res.status(200);
//         res.json({ name });
//     } catch (e) {
//         console.log(e);
//         if (e.code && parseInt(e.code)) {
//             res.status(e.code);
//         } else {
//             res.status(500);
//         }
//         res.json({error: e.message});
//     }
// }

exports.googleLogout = (request, response, next) => {
    // request.logout();
    request.logout(function(err) {
        if (err) {
            return next(err);
        }
        request.session.destroy();
        response.send({status: 'success'});
        // return response.redirect('/');
    });
}

exports.googleAuthenticated = (req, res) => {
    try {
        if (req.user) {
            return res.status(200).send({status: true});
        } else {
            return res.status(200).send({status: false});
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({errors: e});
    }
}

// exports.gov_login = async (req, res, next) => {
//     try {
//         return res.status(200).send('<a href="/api/auth/google">login</a>');
//     } catch (e) {
//         console.log(e);
//         res.status(500).send({errors: e});
//     }
// }

// exports.nih_login = async (req, res, next) => {
//     try {
//         return res.status(200).send('<a href="/api/auth/google">login</a>');
//     } catch (e) {
//         console.log(e);
//         res.status(500).send({errors: e});
//     }
// }