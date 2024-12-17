// npm i -g nodemon express http-proxy-middleware dotenv
let serverBaseName = '/web/backend/v1.0';

require('dotenv').config();
let port = 8080;

const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

const { createProxyMiddleware, Filter, Options, RequestHandler } = require('http-proxy-middleware');

const app = express();
// const server = http.createServer(app);

let server;
let protocol;

let privateKey = '/etc/letsencrypt/live/world.ovh/privkey.pem';
let certificate = '/etc/letsencrypt/live/world.ovh/fullchain.pem';

if (false && fs.existsSync(privateKey) && fs.existsSync(certificate)) {
    server = https.createServer({
        key: fs.readFileSync(privateKey),
        cert: fs.readFileSync(certificate)
    }, app);
    protocol = 'https';
    port = 443;
} else {
    server = http.createServer(app);
    protocol = 'http';
    port = 8080;
}

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});


let appnames = ['finance-tracker', 'institution-management'];
// app.get(`/apps/:appname`, (req, res, next) => {
//     // console.log(req.url.split('/'));
//     if (appnames.includes(req.params.appname))
//         return res.redirect(req.url + '/');
//     next();
// });


let tmpPort = port;
for (let appname of appnames) {
    let prt = ++tmpPort;
    console.log('Starting ' + prt);
    const app1 = require('./apps/' + appname + '/server.js');
    app1.listen(prt, () => {
        console.log(`App: ${appname} running on http://localhost:${prt}`);
    });
    app.use(`/apps/` + appname,
        createProxyMiddleware({
            target: 'http://localhost:' + prt,
            changeOrigin: true,
        }),
    );
}
// fallback if no route matches
app.use((req, res) => res.status(404).send('Not Found ' + req.url));
server.listen(port, () => {
    console.log(`Server running on ${protocol}://localhost:${port}`);
});

let gitProcess = { locked: false, cancel: null };
// periodic pull
setInterval(async () => {
    // cd
    // git pull
    if (gitProcess.locked) gitProcess.cancel();
    gitProcess.locked = true;
    let [result, cancel] = exec(`cd ${path.join(__dirname, 'static')} && git pull`);
    gitProcess.cancel = cancel;

    let [error, stdout, stderr] = await result;
    gitProcess.locked = false;
    gitProcess.cancel = null;


    // console.log(error, stdout, stderr);
}, 5000);

function exec(cmd) {
    let resolve;
    let process = require('child_process').exec(cmd, (error, stdout, stderr) => {
        resolve([error, stdout, stderr]);
    });
    let cancel = () => process.kill('SIGKILL');
    let promise = new Promise((r) => {
        resolve = r;
    });
    return [promise, cancel];
}
