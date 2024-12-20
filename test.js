const fs = require('fs');
const path = require('path');

let imageBlob2 = Buffer.from(fs.readFileSync(path.join(__dirname, 'static', 'imgs', 'codeplay.png')));// await fs.readFileSync(path.join(__dirname, 'static', 'imgs', 'codeplay.png'));

(async () => {

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



    // const postResponse = await fetch('http://localhost:8080/flux', {
    const postResponse = await fetch('https://www.world.ovh/flux', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dat)
    });

    const postData = await postResponse.json();
    console.log('Received data:', postData.data);

})().catch(console.error);