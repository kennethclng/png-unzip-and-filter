const path = require("path");
const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");

IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(() => IOhandler.readDir(pathUnzipped))
    .then((data) => {
        IOhandler.applyFilter(data, "grayscaled");
        IOhandler.applyFilter(data, "sepia");
    })
    .catch((err) => console.log(err))