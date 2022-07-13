const express = require('express');
const router = express.Router();
const url = require('url');

router.get(
    '/profile',
    (request, response) => {
        const queryObject = url.parse(request.url, true).query;
        response.redirect(`/?code=${queryObject.code}&type=nih`);
    }
);

/* Temporary redirect file download request to avoid CORS issue */
// router.get('/files/:fileId', async function(req, res, next) {
//     try {
//         const fileId = req.params.fileId;
//         const result = await axios.get('http://localhost:4000/api/files/' + fileId, {
//             headers: {
//                 Cookie: req.headers.cookie
//             }
//         });
//         res.json(result.data);
//     } catch (e) {
//         console.log(e);
//         if (e.response) {
//             return res.status(e.response.status).send();
//         } else {
//             res.status(500).send();
//         }
//     }
// })
module.exports = router;