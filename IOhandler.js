const yauzl = require("yauzl-promise"),
    fs = require("fs"),
    PNG = require("pngjs").PNG,
    path = require("path"),
    { pipeline } = require("stream/promises");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = async (pathIn, pathOut) => {
    const zip = await yauzl.open(pathIn);
    try {
        for await (const entry of zip) {
            if (entry.filename.includes("/")) {
                continue;
            } else {
                const readStream = await entry.openReadStream();
                const writeStream = fs.createWriteStream(`${pathOut}/${entry.filename}`);
                await pipeline(readStream, writeStream);
            }
        }
        console.log("Extraction operation complete :')")
    } finally {
        await zip.close();
    }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
        }) 
    })
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const applyFilter = (arrIn, pathOut) => {
    arrIn.forEach((pngFile) => {
        fs.createReadStream(`unzipped/${pngFile}`)
            .pipe(
                new PNG({})
            )
            .on("parsed", function() {
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        var idx = (this.width * y + x) << 2;
                        
                        if (pathOut == "grayscaled") {
                            var avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;
                            this.data[idx] = avg;
                            this.data[idx + 1] = avg;
                            this.data[idx + 2] = avg;
                        } else { // assuming we're only handling grayscale or sepia 
                            var newRed = 0.393 * this.data[idx] + 0.769 * this.data[idx + 1] + 0.189 * this.data[idx + 2];
                            var newGreen = 0.349 * this.data[idx] + 0.686 * this.data[idx + 1] + 0.168 * this.data[idx + 2];
                            var newBlue = 0.272 * this.data[idx] + 0.534 * this.data[idx + 1] + 0.131 * this.data[idx + 2];

                            this.data[idx] = Math.round(Math.min(255, newRed));
                            this.data[idx + 1] = Math.round(Math.min(255, newGreen));
                            this.data[idx + 2] = Math.round(Math.min(255, newBlue));
                        }

                    }
                  }
              
                  this.pack().pipe(fs.createWriteStream(`${pathOut}/${pngFile}`));
            })
    })
};

module.exports = {
    unzip,
    readDir,
    applyFilter,
};
