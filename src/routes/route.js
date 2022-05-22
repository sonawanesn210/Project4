const express = require('express');
const router = express.Router();
const urlController=require('../controller/urlController')




router.post('/url/shorten',urlController.createUrl)

router.get('/:urlCode',urlController.reDirectUrl)
//If url is Incorrect
 router.post("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})
router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})
 
module.exports = router;