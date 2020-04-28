const fs = require('fs');
const https = require('https');
const path = require('path');

let merge = [];
module.exports.getMovie = async function (req, res) {


  const id = req.params.id;
  let fileData = await getFile(id);

  let serverArray = [];
  for (let i = 0; i < fileData.length; i++) {
    const imdbId = fileData[i].imdbId;
    await getFromAPI(imdbId).then(res => {
      serverArray.push(res);
    })
  }
 // console.log('1', serverArray);

   merge = await mergeBothObjects(fileData,serverArray);
  return res.json(200, {
    message: 'aagya',
    data: merge
  })
}

module.exports.searchMovie = async function(req,res){
  try{

    console.log(req.query);

  }catch(err){
    return res.json(500,{
      message:'server error'
    })
  }
}

let mergeBothObjects = async function(localFile, serverFile){
    try{
      let newArrray = [];
      localFile.forEach(file=>{
        serverFile.forEach(element=>{
          if(file.imdbId == element.imdbID){
           // file.title = element.Title;
           let directorArray = element.Director.split(',');
           element.Director = directorArray;
           let writerArray = element.Writer.split(',');
           element.Writer = writerArray;
           let actorArray = element.Actors.split(',');
           element.Actors = actorArray;
          //  element.Ratings = Object.assign(element.Ratings,file.userrating);
             file = Object.assign(file,element,{title:element.Title},
                                {description:element.Plot},{RunTime:file.duration})
              delete file.Title;
              delete file.Plot;
              delete file.duration;
            }
        })
      })

      return localFile;
    }catch(err){
      console.log('error',err);
    }

}

let getFromAPI = function (id) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.omdbapi.com/?i=${id}&apikey=68fd98ab&plot=full`, (res) => {

      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;

      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
          `Expected application/json but received ${contentType}`);
      }

      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
      }

      res.setEncoding('utf8');
      let rawData = '';

      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          // console.log(parsedData);
          resolve(parsedData);
        } catch (e) {
          reject(e.message);
        }
      });
    }).on('error', (e) => {
      reject(`Got error: ${e.message}`);
    });
  })
}


let getFile = async function () {
  //  let localId = id + '.json';
  try {

    let finalJSONLocal = [];
    let moviesPath = path.join(__dirname, '../movies');
    let fileNames = await fs.readdirSync(moviesPath);
    fileNames.forEach((element) => {
      let singleMovieFilePath = path.join(moviesPath, '/', element);
      let rawData = fs.readFileSync(singleMovieFilePath);
      let data = JSON.parse(rawData);
      finalJSONLocal.push(data);
    })

    return finalJSONLocal;
  } catch (error) {
    console.log('err', error);
  }
}



