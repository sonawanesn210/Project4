const urlModel = require('../model/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid');
const redis = require('redis')
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


const createUrl = async (req, res) => {
  try {

    let data = req.body


    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "Oops, You forgot to enter the data" });
    }


    const longUrl = data.longUrl

    if (!longUrl) {
      return res.status(400).send({ status: false, message: "Long url is required" });
    }

    if (!validUrl.isUri(longUrl)) { return res.status(400).send({ status: false, message: 'Please provide a valid longurl' }) }

    const urlCode = shortid.generate().toLowerCase()

    const shortUrl = "http://localhost:3000/" + urlCode

    data.urlCode = urlCode
    data.shortUrl = shortUrl

    let Data = {
      longUrl: longUrl,
      shortUrl: shortUrl,
      urlCode: urlCode
    }

    // let urlcodeAndShortUrl = await urlModel.findOne({ shortUrl: shortUrl, urlCode: urlCode })
    //searching for Urlcode and shorturl in DB
    /* if (urlcodeAndShortUrl) {
      if (urlcodeAndShortUrl.urlCode == urlCode) return res.status(400).send({ status: false, message: "urlcode already exits" })
      if (urlcodeAndShortUrl.shortUrl == shortUrl) return res.status(400).send({ status: false, message: "Shorturl already exits" })
    } */
    let cacheUrl = await GET_ASYNC(longUrl)
    
    let json = JSON.parse(cacheUrl)
    //console.log(cacheUrl)
    if (json) {
  
      //console.log("json")
 return res.status(201).send({ status: true, data: json })
    }
    let uniqueLongUrl = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })


    if (uniqueLongUrl) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(uniqueLongUrl))
      return res.status(200).send({ status: true, data: uniqueLongUrl })
    }
    const url = await urlModel.create(Data)
    if (url) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(Data))
      return res.status(201).send({ status: true, message: 'URL create successfully', data: Data })
    }
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}



//=================================GET /:urlCode=========================================//
const reDirectUrl = async (req, res) => {
  try {
    let urlCode = req.params.urlCode
    let findUrl = await GET_ASYNC(urlCode)

    let newurl = JSON.parse(findUrl)
    if (!newurl) {
      let getUrlCode = await urlModel.findOne({ urlCode: urlCode })
      if (!getUrlCode) {
        return res.status(404).send({ status: false, message: "Urlcode Not Found" });
      }
      await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrlCode.longUrl))

    }
    return res.status(302).redirect(newurl)

  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}



module.exports.createUrl = createUrl
module.exports.reDirectUrl = reDirectUrl






