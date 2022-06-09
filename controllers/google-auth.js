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

exports.logout = (req, res, next) => {
    try {
        if (req.session) {
            req.session.destroy( (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({errors: err});
                }
                res.status(200).send({status: 'success'});
            });
        } else {
            return res.status(200).send({status: 'success'});
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
    // request.logout();
    // request.logout(function(err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     request.session.destroy();
    //     response.send({status: 'success'});
    //     // return response.redirect('/');
    // });
}

exports.authenticated = (req, res) => {
    try {
        if (req.session.tokens) {
            return res.status(200).send({status: true});
        } else {
            return res.status(200).send({status: false});
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({errors: e});
    }
    // try {
    //     if (req.user) {
    //         return res.status(200).send({status: true});
    //     } else {
    //         return res.status(200).send({status: false});
    //     }
    // } catch (e) {
    //     console.log(e);
    //     res.status(500).send({errors: e});
    // }
}