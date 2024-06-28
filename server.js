// npm i -g nodemon express http-proxy-middleware dotenv

require('dotenv').config();
const PORT = process.env.PORT || 80;

const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const { createProxyMiddleware, Filter, Options, RequestHandler } = require('http-proxy-middleware');

const app = express();
// const server = http.createServer(app);

let server;

let privateKey = '/etc/letsencrypt/live/world.ovh/privkey.pem';
let certificate = '/etc/letsencrypt/live/world.ovh/fullchain.pem';

if (fs.existsSync(privateKey) && fs.existsSync(certificate)) {
    server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);
} else {
    server = http.createServer(app);
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});


let appnames = ['institution-management'];

app.get('/apps/:appname', (req, res, next) => {
    // console.log(req.url.split('/'));
    if (req.url.split('/').length == 3 && appnames.includes(req.params.appname))
        return res.redirect(req.url + '/');
    next();
});


let tmpPort = PORT;
for (let appname of appnames) {
    tmpPort++;
    const app1 = require('./apps/' + appname + '/server.js');
    app1.listen(tmpPort, () => {
        console.log(`Server running on http://localhost:${tmpPort}`);
    });
    app.use('/apps/' + appname,
        createProxyMiddleware({
            target: 'http://localhost:' + tmpPort,
            changeOrigin: true,
        }),
    );
}
server.listen(80, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
