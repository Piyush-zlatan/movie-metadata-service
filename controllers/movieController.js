const fs = require('fs');
const https = require('https');
const path = require('path');


let merge = [];
module.exports.getMovie = async function (req, res) {


  const id = req.params.id;
  let fileData = await getFile();

  let serverArray = [];
  for (let i = 0; i < fileData.length; i++) {
    const imdbId = fileData[i].imdbId;
    await getFromAPI(imdbId).then(res => {
      serverArray.push(res);
    })
  }

  merge = await mergeBothObjects(fileData, serverArray);
  return res.json(200, {
    message: 'Done',
    data: merge
  })
}

module.exports.searchMovie = async function (req, res) {
  try {
    if (merge.length == 0) {
      let localobj = await getFile();

      let serverArray = [];
      for (let i = 0; i < fileData.length; i++) {
        const imdbId = fileData[i].imdbId;
        await getFromAPI(imdbId).then(res => {
          serverArray.push(res);
        })
      }
      merge = mergeBothObjects(localobj,serverArray);  
    }
      let requiredMovies = searchByQuery(req.query);

      return res.json(200,{
        message: 'found',
        data:requiredMovies
      });

  } catch (err) {
    return res.json(500, {
      message: 'server error'
    })
  }
}

// Merging two json objects
let mergeBothObjects = async function (localFile, serverFile) {
  try {
    localFile.forEach(file => {
      serverFile.forEach(element => {
        if (file.imdbId == element.imdbID) {
          // file.title = element.Title;
          let directorArray = element.Director.split(',');
          element.Director = directorArray;
          let writerArray = element.Writer.split(',');
          element.Writer = writerArray;
          let actorArray = element.Actors.split(',');
          element.Actors = actorArray;
          //  element.Ratings = Object.assign(element.Ratings,file.userrating);
          file = Object.assign(file, element, { title: element.Title },
            { description: element.Plot }, { RunTime: file.duration })
          delete file.Title;
          delete file.Plot;
          delete file.duration;
        }
      })
    })

    return localFile;
  } catch (err) {
    console.log('error', err);
  }

}
// Reading from server
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

// Reading from local files
let getFile = async function () {
  //  let localId = id + '.json';
  try {

    let finalJSONLocal = [];
    let moviesPath = path.join(__dirname, '../movies');
    let fileNames = await fs.readdirSync(moviesPath);
    fileNames.forEach((element) => {
      let singleMoviePath = path.join(moviesPath, '/', element);
      let raw = fs.readFileSync(singleMoviePath);
      let data = JSON.parse(raw);
      finalJSONLocal.push(data);
    })

    return finalJSONLocal;
  } catch (error) {
    console.log('err', error);
  }
}



