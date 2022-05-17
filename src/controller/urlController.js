const urlModel=require('../model/urlModel')
const validUrl=require('valid-url')
const shortid = require('shortid');

const createUrl=async (req,res) =>{
try{
   


    if (Object.keys(req.body).length == 0) {
        return res.status(400).send({ status: false, message: "Feild Can't Empty.Please Enter Some Details" });
      }

      //const obj={}

 const longUrl=req.body.longUrl
const baseUrl="http://localhost:3000"

if (!validUrl.isUri(baseUrl)) {
    return res.status(400).send({ status: false, message: "Please provide a valid Baseurl" });
  }
 if(!longUrl){
    return res.status(400).send({ status: false, message: "Long url is required" });
}

if (!validUrl.isUri(longUrl)) { return res.status(400).send({ status: false, message: 'Please provide a valid longurl' }) }

let uniqueLongUrl=await urlModel.findOne({longUrl})
if(uniqueLongUrl){
    return res.status(400).send({ status: false, message: `${longUrl} this urlcode  Already exist.Please,try again with another url` })
}
const urlCode=shortid.generate()

const shortUrl=baseUrl+'/'+urlCode



const Data=  
{
    urlCode: urlCode,
    shortUrl: shortUrl,
    longUrl: longUrl
}
const url=await urlModel.create(Data)
return res.status(201).send({ status: true, message: 'Document created', data: Data })
}
catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}



//=================================GET /:urlCode=========================================//
 const reDirectUrl=async (req,res) =>{
    try{
let urlCode= req.params.urlCode
if(urlCode){
let getUrlCode=await urlModel.findOne({urlCode:urlCode})
if(!getUrlCode) {
return  res.status(404).send({ status: false, message: "Urlcode Not Found" });
}
return res.status(302).redirect(getUrlCode.longUrl);
}}
catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
} 



module.exports.createUrl=createUrl
module.exports.reDirectUrl=reDirectUrl






