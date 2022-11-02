// Load fs so we can interact with file system and load/serve html from files on disk
// We want the promises version so we can use .then and .catch when loading our static profile HTML
const fs = require("fs").promises;

// Extract profile name from req.url, attempt to load and send corresponding static HTML
exports.loadProfile = (req, res) => {
  const profileName = req.url.split("/").slice(-1)[0];
  const publicPath = __dirname.split("\\");
  publicPath.pop();
  const publicDir = publicPath.join("\\");
  fs.readFile(publicDir + "/public/" + profileName + "/index.html")
    .then((contents) => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    })
    .catch((err) => {
      console.log(err);
      res.writeHead(500);
      res.end(err);
      return;
    });
};

exports.loadStatic = (req, res) => {
  const segments = req.url.split("/");
  segments.splice(1, 1, "public");
  const newPath = segments.join("/");
  console.log("loading static resources from", newPath);
  const publicPath = __dirname.split("\\");
  publicPath.pop();
  const publicDir = publicPath.join("\\");
  fs.readFile(publicDir + newPath)
    .then((contents) => {
      res.writeHead(200);
      res.end(contents);
    })
    .catch((err) => {
      res.writeHead(500);
      res.end(err);
      return;
    });
};
