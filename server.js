let http = require('http'),
    fs = require('fs'),
    url = require('url'),
    querystring = require('querystring'),
    mime = require('mime-types');

let STORE_PATH = 'upload';
let PORT = 9999;
let HOST = 'localhost';
let WHITE_LIST = [];

if (!fs.existsSync(STORE_PATH))
    fs.mkdirSync(STORE_PATH);

http.createServer(function (req, res) {
    let remoteAddress = req.connection.remoteAddress;
    let folder = `${STORE_PATH}/${remoteAddress}`;

    if (WHITE_LIST.length > 0 && WHITE_LIST.indexOf(remoteAddress) < 0) {
        res.end('HELLO');
        return;
    }

    let reqUrl = url.parse(req.url),
        reqPath = reqUrl.pathname,
        reqParams = querystring.parse(reqUrl.query);

    if (reqPath == '/') reqPath = '/client.html';

    if (reqPath.indexOf('/uploadService/') == 0) {
        if (reqPath.indexOf('/checkFile/') > 0) {
            let filePath = `${folder}/${decodeURIComponent(reqPath.substring('/uploadService/checkFile/'.length))}`;
            let existedSize = 0;
            if (fs.existsSync(filePath)) {
                existedSize = fs.statSync(filePath).size;
            }
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end(existedSize.toString());
        } else if (reqPath.indexOf('/breakpointUpload/') > 0) {
            let filePath = `${folder}/${decodeURIComponent(reqPath.substring('/uploadService/breakpointUpload/'.length))}`;
            let index = reqParams.index;
            if (fs.existsSync(filePath)) {
                if (fs.statSync(filePath).size != index) {
                    res.writeHead(500);
                    res.end();
                    fs.unlinkSync(filePath);
                    console.log(`Wrong size! Delete ${filePath}!`);
                    return;
                }
            }
            req.setEncoding("binary");
            let data = '';
            req.on('data', function (chunk) {
                data += chunk
            });
            if (!fs.existsSync(folder))
                fs.mkdirSync(folder);
            req.on('end', () => fs.appendFile(filePath, data, 'binary', function (err) {
                res.end(fs.statSync(filePath).size.toString());
            }));
        }
    } else {
        fs.readFile(process.cwd() + reqPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            var mimeType = mime.lookup(reqPath) || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': data.length
            });
            res.end(data);
        });
    }
}).listen(PORT, HOST);

console.log(`server started http://${HOST}:${PORT}`);