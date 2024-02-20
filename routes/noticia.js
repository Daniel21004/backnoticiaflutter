var express = require('express');
var router = express.Router();

const fs = require('fs')

const auth = require('../app/middleware/auth')

const multer = require('multer')
const path = require('path');
const MIMETYPES = ['image/jpeg', 'image/png'];

const multerUpload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, '../public/multimedia'),
        filename: (req, file, callback) => {
            const fileExtension = path.extname(file.originalname);
            const fileName = file.originalname.split(fileExtension)[0];

            callback(null, `${fileName}${fileExtension}`)
        }
    }),
    fileFilter: (req, file, cb) => {
        if (MIMETYPES.includes(file.mimetype)) cb(null, true)
        else cb(new Error(`Los formatos admitidos son ${MIMETYPES.join(' ')}`))
    },
}).single('file')


const NoticiaC = require('../app/controllers/noticiaController');
let noticiaController = new NoticiaC()


/* LIST noticia */
router.get('/list', noticiaController.listar);
router.get('/listuser', noticiaController.listarDisponible);

/* GET noticia */
router.get('/obtener/:external', noticiaController.obtener);

/* SAVE noticia */
router.post('/save', noticiaController.guardar);

//! Creo que no se va a utilizar lo de subida de img
// router.post('/photo', multerUpload.single('file'), noticiaController.hola);
router.post('/photo', auth(['ADMIN']), function (req, res) {
    multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log('XDDDDDDDDDDDDDD');
            res.send(err)
            return res;
        } else if (err) {
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAA');
            const error = String(err).split('Error: ').pop();
            res.status(400)
            res.json({ msg: 'ERROR', tag: error, status: 400 })
            return res;
        }

        try {
            console.log(req.file);
            console.log(req.body.external);
            res.status(200);
            res.json({ msg: "OK", tag: "Se ha guardado con exito", code: 200 });
            return res;

        } catch (error) {
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAA');
            const errorString = String(error).split('Error: ').pop();
            res.status(400)
            res.json({ msg: 'ERROR', tag: errorString, status: 400 })
            return res;
        }
    })
});


module.exports = router;
