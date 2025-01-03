// npm i -g @gradio/client dotenv express http-proxy-middleware nodemon
// NODE_PATH = C:\Users\Admin\AppData\Roaming\npm\node_modules || /usr/local/lib/node_modules

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
let appnames = fs.existsSync(path.join(__dirname, 'apps')) && fs.readdirSync(path.join(__dirname, 'apps')) || [];

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/test', (req, res) => {
    res.send('test');
});
app.get('/img', (req, res) => {
    res.redirect('/');
});

app.get('/appnames', (req, res) => {
    res.json(appnames);
});


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


app.use(express.json({ limit: '50mb' })); // for parsing application/json
app.post('/flux', async (req, res) => {

    try {

        const gradio_client = import('@gradio/client');
        let Client = ((await gradio_client).Client);

        let { imageBlob, maskBlob, compositeBlob, prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps } = req.body;
        imageBlob = Buffer.from(imageBlob, 'base64');
        maskBlob = Buffer.from(maskBlob, 'base64');
        compositeBlob = Buffer.from(compositeBlob, 'base64');
        // console.log('flux', req.body);
        // console.log(imageBlob, maskBlob, compositeBlob, prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps)
        let client = await Client.connect("black-forest-labs/FLUX.1-Fill-dev", { hf_token: "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" });
        let result = await client.predict("/infer", {
            edit_images: { "background": imageBlob, "layers": [maskBlob], "composite": compositeBlob },
            prompt: prompt,
            seed: seed,
            randomize_seed: randomize_seed,
            width: width,
            height: height,
            guidance_scale: guidance_scale, num_inference_steps: num_inference_steps,
        });
        console.log(result.data[0].url)
        res.json(result);
    } catch (error) {
        console.log(error);
        try {
            res.json({ ...error });
        } catch (error) {
            res.json({ error: 'Unknown error' });
        }
    }
});


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


function safe(fn, onError = () => { }) {
    try {
        let res = fn();
        if (res instanceof Promise) {
            return (async (resolve, reject) => {
                try {
                    return (await res);
                } catch (e) {
                    if (onError) onError(e);
                    return null;
                }
            })();
        } else {
            return res;
        }
    } catch (e) {
        if (onError) onError(e);
        return null;
    }
}

