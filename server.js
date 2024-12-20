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
let appnames = fs.existsSync(path.join(__dirname, 'apps')) && fs.readdirSync(path.join(__dirname, 'apps')) || [];

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/test', (req, res) => {
    res.send('test');
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


(async () => {

    try {

        const gradio_client = import('@gradio/client');
        let Client = ((await gradio_client).Client);

        let imageBlob = Buffer.from(fs.readFileSync(path.join(__dirname, 'static', 'imgs', 'codeplay.png')));// await fs.readFileSync(path.join(__dirname, 'static', 'imgs', 'codeplay.png'));
        let maskBlob = imageBlob;
        let compositeBlob = imageBlob;
        let client = await Client.connect("black-forest-labs/FLUX.1-Fill-dev", { hf_token: "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" });
        let result = await client.predict("/infer", {
            edit_images: { "background": imageBlob, "layers": [maskBlob], "composite": compositeBlob },
            prompt: "Hello",
            seed: 0,
            randomize_seed: true,
            width: 500,
            height: 500,
            guidance_scale: 30,
            num_inference_steps: 30,
        });
        console.log(result.data[0].url)



        const fetchResult = async () => {
            try {
                // First make the POST request
                const postResponse = await fetch('https://black-forest-labs-flux-1-fill-dev.hf.space/gradio_api/call/infer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: [
                            {
                                background: imageBlob, // You'll need to handle file upload separately
                                layers: [maskBlob],
                                composite: compositeBlob
                            },
                            "Hello", // prompt
                            0,         // seed
                            true,      // randomize seed
                            1200,       // width
                            1200,       // height
                            10,         // guidance scale
                            10          // inference steps
                        ]
                    })
                });

                const postData = await postResponse.json();
                console.log('Received data:', postData);
                const eventId = postData.event_id;
                const https = require('https');

                /**
                 * Asynchronously reads from a Server-Sent Events (SSE) stream.
                 * @param {string} url - The URL of the SSE stream.
                 * @returns {Promise<void>} Resolves when the connection ends or errors.
                 */
                async function readSSEStream(url) {
                    return new Promise((resolve, reject) => {
                        const req = https.get(url, (res) => {
                            // Validate content type
                            const contentType = res.headers['content-type'];
                            if (!contentType || !contentType.startsWith('text/event-stream')) {
                                reject(new Error(`Unexpected content type: ${contentType}`));
                                return;
                            }

                            console.log('Connected to the event stream.');

                            // Listen for chunks of data
                            res.on('data', (chunk) => {
                                const message = chunk.toString();
                                console.log('Received message:', message);

                                // Parse "data: ..." messages (basic parsing logic)
                                if (message.startsWith('data: ')) {
                                    const data = message.slice(6).trim();
                                    console.log('Parsed data:', data);
                                }
                            });

                            // Handle stream end
                            res.on('end', () => {
                                console.log('Connection closed.');
                                resolve();
                            });

                            // Handle errors
                            res.on('error', (err) => {
                                console.error('Stream error:', err);
                                reject(err);
                            });
                        });

                        // Handle request errors
                        req.on('error', (err) => {
                            console.error('Request error:', err);
                            reject(err);
                        });
                    });
                }

                // Then make the GET request using the event ID
                const getResponse = await fetch(
                    `https://black-forest-labs-flux-1-fill-dev.hf.space/gradio_api/call/infer/${eventId}`
                );

                // We should check the actual response type from the headers
                console.log(await readSSEStream(`https://black-forest-labs-flux-1-fill-dev.hf.space/gradio_api/call/infer/${eventId}`));

            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchResult();
    } catch (error) {
        console.log(error);
    }
});


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
            res.status(500).json({ ...error });
        } catch (error) {
            res.status(500).json({ error: 'Unknown error' });
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

