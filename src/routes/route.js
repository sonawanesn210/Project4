const express = require('express');
const router = express.Router();


//If url is Incorrect
router.post("*", (req,res) =>{

    return res.status(404).send({ message:"Page Not Found"})
})
router.get("*", (req,res) =>{
    return res.status(404).send({ message:"Page Not Found"})
})

module.exports = router;