const urlModel=require('../model/urlModel')
const validUrl=require('valid-url')
const shortid = require('shortid');
const redis=require('redis')
const { promisify } = require("util");


//========================Connect to redis===============================================================//
const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//==============================================POST /url/shorten================================//


const createUrl=async (req,res) =>{
try{
   
    let data=req.body


    if (Object.keys(data).length == 0) {
        return res.status(400).send({ status: false, message: "Oops, You forgot to enter the data" });
      }


 const longUrl=data.longUrl
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
const urlCode=shortid.generate().toLowerCase()

const shortUrl=baseUrl+'/'+urlCode

data.urlCode=urlCode
data.shortUrl=shortUrl


const url=await urlModel.create(data)
let Data={
  longUrl: url.longUrl,
  shortUrl: url.shortUrl,
  urlCode:url. urlCode
}
return res.status(201).send({ status: true, message: 'URL create successfully', data: Data })
}
catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}



//=================================GET /:urlCode=========================================//
  const reDirectUrl=async (req,res) =>{
    try{
let urlCode= req.params.urlCode
 let findUrl=await GET_ASYNC(urlCode)
 
let newurl=JSON.parse(findUrl)
console.log(urlCode)
console.log(findUrl)
if(newurl){
 
 return res.status(302).redirect(newurl)
}
else {
let getUrlCode=await urlModel.findOne({urlCode:urlCode})
if(!getUrlCode) {
return  res.status(404).send({ status: false, message: "Urlcode Not Found" });
} 
console.log(getUrlCode)
  //  SETTING : url data in cache
  await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrlCode.longUrl))
  
return res.status(302).redirect(getUrlCode.longUrl);

}

}
catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}  



module.exports.createUrl=createUrl
module.exports.reDirectUrl=reDirectUrl






