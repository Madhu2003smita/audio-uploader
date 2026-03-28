const express = require("express");
const path = require('path');
const app = express();
const {storage} = require('./multer')
const multer = require('multer')



const upload = multer ({storage})

app.get("/upload", (req, res) => {
    res.send("Use POST method to upload file");
});



app.use("/upload", express.static("upload"));


app.post('/upload',upload.any(),(req,res)=>{
    res.json({
        message:'file upload successful',
        file:req.file,
    })
})




app.listen(5000, () => {
  console.log("Server running on port 5000");
});