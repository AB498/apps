const fs = require('fs');
const path = require('path');

const { Blob } = require('buffer'); // Import Blob from the buffer module

async function blobToUint8Array(blob) {
    const arrayBuffer = await blob.arrayBuffer(); // Convert Blob to ArrayBuffer
    return new Uint8Array(arrayBuffer);          // Convert ArrayBuffer to Uint8Array
}

function uint8ArrayToBase64(uint8Array) {
    let binary = '';
    const chunkSize = 8192; // Process in chunks to avoid stack size issues

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize); // Get a chunk of the array
        binary += String.fromCharCode(...chunk);            // Convert chunk to string
    }

    return btoa(binary); // Convert the binary string to Base64
}

(async () => {

    let imageBlob2 = await uint8ArrayToBase64(new Uint8Array(await (new Blob([fs.readFileSync(path.join(__dirname, 'static', 'imgs', 'codeplay.png'))])).arrayBuffer()));
    // console.log(imageBlob2);
    const gradio_client = import('@gradio/client');
    let Client = ((await gradio_client).Client);

    let dat = {
        imageBlob: imageBlob2, // You'll need to handle file upload separately
        maskBlob: imageBlob2,
        compositeBlob: imageBlob2,
        prompt: "Hello", // prompt
        seed: 0,         // seed
        randomize_seed: true,      // randomize seed
        width: 1200,       // width
        height: 1200,       // height
        guidance_scale: 10,         // guidance scale
        num_inference_steps: 10          // inference steps

    };

    // let { imageBlob, maskBlob, compositeBlob, prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps } = dat;
    // console.log(imageBlob);
    // let client = await Client.connect("black-forest-labs/FLUX.1-Fill-dev", { hf_token: "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" });
    // let result = await client.predict("/infer", {
    //     edit_images: { "background": imageBlob, "layers": [maskBlob], "composite": compositeBlob },
    //     prompt: prompt,
    //     seed: seed,
    //     randomize_seed: randomize_seed,
    //     width: width,
    //     height: height,
    //     guidance_scale: guidance_scale, num_inference_steps: num_inference_steps,
    // });
    // console.log(result.data[0].url)
    // res.json(result.data);



    const postResponse = await fetch('https://www.world.ovh/flux', {
    // const postResponse = await fetch('http://localhost:8080/flux', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dat)
    });

    const postData = await postResponse.json();
    console.log('Received data:', postData);

})().catch(console.error);