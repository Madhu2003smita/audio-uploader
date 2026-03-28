const multer = require("multer");
const fs = require('fs');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        let folder
        if (file.mimetype.startsWith('image')) {
            folder = 'upload/image';
        } else if (file.mimetype.startsWith('audio')) {
            folder = 'upload/audio'
        } else if (file.mimetype.startsWith('video')) {
            folder = 'upload/video'
        }

        fs.mkdirSync(folder, {recursive: true})


        cb(null, folder)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

module.exports= {storage}