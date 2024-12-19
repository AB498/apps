(() => {
    let Component = (props) => {
        let { homePage, imageFile } = props || {};
        let [componentState, setComponentState] = useState({ step: 'setup', canvasControls: [], drawMode: 'brush' });
        window.componentState = componentState;
        let divRef = useRef(null);
        async function initialSetup() {
            let canvasContainer = document.querySelector('.konva-canvas');
            let stage = new Konva.Stage({
                // draggable: true,
                container: canvasContainer,
                width: divRef.current?.offsetWidth || 500,
                height: divRef.current?.offsetHeight || 400
            });
            setComponentState((p) => ({ ...p, stage }));
        }
        async function loadSelectedImage() {
            let layer = new Konva.Layer({
                id: 'main-layer'
            });
            let uploadImage = await getImageFromURL(URL.createObjectURL(imageFile));
            console.log(uploadImage.width, uploadImage.height);
            let konvaImage = new Konva.Image({
                image: uploadImage,
                // x: componentState.stage.width() / 2 - (componentState.stage.height() / uploadImage.height) * uploadImage.width / 2,
                x: 0,
                y: 0,
                width: uploadImage.width,
                height: uploadImage.height

            });
            var group = new Konva.Group({
                id: 'source-image-group',
                clip: {
                    x: 0,
                    y: 0,
                    width: uploadImage.width,
                    height: uploadImage.height,
                },
            });
            group.add(konvaImage);
            layer.add(group);
            componentState.stage.add(layer);
            let reqScaleX = componentState.stage.width() / uploadImage.width;
            let reqScaleY = componentState.stage.height() / uploadImage.height;
            if (reqScaleX > reqScaleY) {
                componentState.stage.scaleY(reqScaleY);
                componentState.stage.scaleX(reqScaleY);
                // pan stage 
                componentState.stage.x(componentState.stage.width() / 2 - (componentState.stage.height() / uploadImage.height) * uploadImage.width / 2);
                componentState.stage.y(0);
            } else {
                componentState.stage.scaleY(reqScaleX);
                componentState.stage.scaleX(reqScaleX);
                // pan stage 
                componentState.stage.x(0);
                componentState.stage.y(componentState.stage.height() / 2 - (componentState.stage.width() / uploadImage.width) * uploadImage.height / 2);
            }
            setComponentState((p) => ({ ...p, currentImage: uploadImage, originalImage: uploadImage }));
        }
        useEffect(() => {
            (async () => {
                await initialSetup();
                await new Promise((resolve) => setTimeout(resolve, 100));
                setComponentState((p) => ({ ...p, step: 'begin' }));

            })();
        }, []);
        useEffect(() => {
            (async () => {
                try {

                    if (componentState.step == 'begin') {
                        console.log('begin');
                        await loadSelectedImage();
                        setComponentState((p) => ({ ...p, step: 'bg-removal-ongoing' }));
                        return;
                    }
                    if (componentState.step == 'bg-mask-setting-apply') {
                        const prevStates = {
                            scaleX: componentState.stage.scaleX(),
                            scaleY: componentState.stage.scaleY(),
                            x: componentState.stage.x(),
                            y: componentState.stage.y(),
                            width: componentState.stage.width(),
                            height: componentState.stage.height()
                        }
                        let originalImage = componentState.originalImage;
                        componentState.stage.setAttrs({
                            x: 0,
                            y: 0,
                            scaleX: 1,
                            scaleY: 1,
                            width: originalImage.width,
                            height: originalImage.height
                        });
                        let imgUrl;
                        try {
                            imgUrl = componentState.stage.find('#mask-image-layer')[0].toDataURL({ pixelRatio: 1 });
                        } catch (error) {
                            componentState.stage.setAttrs(prevStates);
                        }
                        componentState.stage.setAttrs(prevStates);

                        let maskImage = await getImageFromURL(imgUrl);

                        maskImage = await cropImage(maskImage, 0, 0, originalImage.width, originalImage.height);
                        maskImage = await convertAlphaToWhite(maskImage);
                        let subtractedImage = await subtractMaskFromImage(originalImage, maskImage, originalImage.width, originalImage.height);
                        componentState.stage.find('#main-image')?.[0]?.image(subtractedImage);

                        // revert
                        setComponentState((p) => ({ ...p, step: 'editing', currentImage: subtractedImage, canvasControls: [] }));
                        let maskLayer = componentState.stage.find('#mask-image-layer')?.[0];
                        maskLayer && (maskLayer.setAttrs({ visible: false }));
                        return;
                    }
                    if (componentState.step == 'bg-mask-setting-cancel') {
                        setComponentState((p) => ({ ...p, step: 'editing', canvasControls: [] }));
                        componentState.stage.find('#main-image')?.[0]?.image(componentState.currentImage);
                        let maskLayer = componentState.stage.find('#mask-image-layer')?.[0];
                        maskLayer && (maskLayer.setAttrs({ visible: false }));
                        return;
                    }
                    if (componentState.step == 'ai-fill-apply') {
                        setComponentState((p) => ({ ...p, canvasControls: [] }));
                        componentState.stage.find('#main-image')?.[0]?.image(componentState.currentImage);
                        let aiFillMaskLayer = componentState.stage.find('#ai-fill-mask-layer')?.[0];
                        aiFillMaskLayer && (aiFillMaskLayer.setAttrs({ visible: false }));
                        return;
                    }
                    if (componentState.step == 'ai-fill-cancel') {
                        setComponentState((p) => ({ ...p, canvasControls: [] }));
                        componentState.stage.find('#main-image')?.[0]?.image(componentState.currentImage);
                        let aiFillMaskLayer = componentState.stage.find('#ai-fill-mask-layer')?.[0];
                        aiFillMaskLayer && (aiFillMaskLayer.setAttrs({ visible: false }));
                        return;
                    }
                    if (componentState.step == 'ai-fill-generating') {
                        setComponentState((p) => ({ ...p, loading: true }));

                        let prompt = componentState.aiPrompt;
                        let image = componentState.currentImage;
                        let aiFillLayer = componentState.stage.find('#ai-fill-mask-layer')?.[0];
                        let aiFillClipperGroup = componentState.stage.find('#ai-fill0-mask-clipper-group')?.[0];


                        const prevStates = {
                            scaleX: componentState.stage.scaleX(),
                            scaleY: componentState.stage.scaleY(),
                            x: componentState.stage.x(),
                            y: componentState.stage.y(),
                            width: componentState.stage.width(),
                            height: componentState.stage.height()
                        }
                        let originalImage = componentState.originalImage;
                        componentState.stage.setAttrs({
                            x: 0,
                            y: 0,
                            scaleX: 1,
                            scaleY: 1,
                            width: originalImage.width,
                            height: originalImage.height
                        });
                        let imgUrl;
                        try {
                            imgUrl = componentState.stage.find('#ai-fill-mask-layer')[0].toDataURL({ pixelRatio: 1 });
                        } catch (error) {
                            componentState.stage.setAttrs(prevStates);
                        }
                        componentState.stage.setAttrs(prevStates);

                        let maskImage = await getImageFromURL(imgUrl);

                        maskImage = await cropImage(maskImage, 0, 0, originalImage.width, originalImage.height);
                        // componentState.stage.getLayers()[componentState.stage.getLayers().length - 1].add(new Konva.Image({ image: maskImage, x: 0, y: 0, width: originalImage.width, height: originalImage.height, draggable: true }));
                        // maskImage = await convertAlphaToWhite(maskImage);

                        // let subtractedImage = await invertAlpha(await subtractMaskFromImage(originalImage, maskImage, originalImage.width, originalImage.height));
                        // componentState.stage.getLayers()[componentState.stage.getLayers().length - 1].add(new Konva.Image({ image: subtractedImage, x: 0, y: 0, width: originalImage.width, height: originalImage.height, draggable: true }));

                        let composite = await imprintOnImage(originalImage, maskImage);

                        console.log('generating. promp:', prompt);
                        let resultUrl = await apis.flux(originalImage, maskImage, composite, prompt);
                        console.log('resultUrl:', resultUrl);
                        let resultImage = await getImageFromURL(resultUrl);
                        componentState.stage.find('#main-image')?.[0]?.image(resultImage);



                        setComponentState((p) => ({ ...p, canvasControls: [], loading: false, currentImage: resultImage }));
                        componentState.stage.find('#main-image')?.[0]?.image(resultImage);
                        let aiFillMaskLayer = componentState.stage.find('#ai-fill-mask-layer')?.[0];
                        aiFillMaskLayer && (aiFillMaskLayer.setAttrs({ visible: false }));
                    }
                    if (componentState.step == 'ai-fill-setup') {
                        let canvasControls = [
                            [<div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                                onClick={() => { setComponentState((p) => ({ ...p, step: 'ai-fill-apply' })) }}>
                                <i className="fi fi-rr-check"></i>
                                <div className="text-xs">Apply</div>
                            </div>, <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                                onClick={() => { setComponentState((p) => ({ ...p, step: 'ai-fill-cancel' })) }}>
                                <i className="fi fi-rr-cross"></i>
                                <div className="text-xs">Cancel</div>
                            </div>,
                            <ul class="flex h-full dark:bg-neutral-800 rounded dark:hover:bg-neutral-700 cursor-pointer overflow-hidden">
                                <li className="has-[:checked]:bg-blue-500 w-full border-b border-gray-200 sm:border-b-0 dark:border-gray-600 flex sm:border-r">
                                    <label for="horizontal-list-radio-license" class="flex items-center px-3 gap-2">
                                        <input id="horizontal-list-radio-license" type="radio" value="brush" name="mask-direction-radio" class="hidden" defaultChecked={componentState.drawMode == 'brush'} onChange={(e) => log(1, e.target.value) && (e.target.checked ? (setComponentState((p) => ({ ...p, drawMode: e.target.value }))) : null)} />
                                        <div className="text-xs">Add</div>
                                    </label>
                                </li>
                                <li className="has-[:checked]:bg-blue-500 w-full border-b border-gray-200 sm:border-b-0 dark:border-gray-600 flex">
                                    <label for="horizontal-list-radio-id" class="flex items-center px-3 gap-2">
                                        <input id="horizontal-list-radio-id" type="radio" value="eraser" name="mask-direction-radio" class="hidden" defaultChecked={componentState.drawMode == 'eraser'} onChange={(e) => log(1, e.target.value) && (e.target.checked ? (setComponentState((p) => ({ ...p, drawMode: e.target.value }))) : null)} />
                                        <div className="text-xs">Subtract</div>
                                    </label>
                                </li>
                            </ul>],
                            [
                                <div className="basis-full flex justify-center gap-2">
                                    <input type="text" placeholder="Enter prompt" className=" p-2 rounded w-full dark:bg-neutral-800 dark:text-white" onChange={(e) => setComponentState((p) => ({ ...p, aiPrompt: e.target.value }))} />
                                    <button className="bg-blue-500 text-white p-2 rounded" onClick={async () => {
                                        setComponentState((p) => ({ ...p, step: 'ai-fill-generating' }));
                                    }}>Send</button>
                                </div>
                            ]

                        ];
                        setComponentState((p) => ({ ...p, canvasControls }));
                        componentState.stage.find('#main-image')?.[0]?.image(componentState.currentImage);


                        let aiFillMaskLayer = componentState.stage.find('#ai-fill-mask-layer')?.[0];
                        let aiFillMaskClipperGroup = componentState.stage.find('#ai-fill0-mask-clipper-group')?.[0];
                        if (aiFillMaskLayer) {
                            aiFillMaskLayer.destroy();
                        }
                        aiFillMaskLayer = new Konva.Layer({
                            id: 'ai-fill-mask-layer',
                            visible: false,
                            x: 0,
                            y: 0,
                            width: componentState.currentImage.width,
                            height: componentState.currentImage.height
                        });
                        componentState.stage.add(aiFillMaskLayer);
                        if (aiFillMaskClipperGroup) {
                            aiFillMaskClipperGroup.destroy();
                        }
                        aiFillMaskClipperGroup = new Konva.Group({
                            clip: {
                                id: 'ai-fill0-mask-clipper-group',
                                x: 0,
                                y: 0,
                                width: componentState.currentImage.width,
                                height: componentState.currentImage.height
                            }
                        });
                        aiFillMaskClipperGroup.add(new Konva.Rect({ width: componentState.currentImage.width, height: componentState.currentImage.height }));
                        aiFillMaskLayer.add(aiFillMaskClipperGroup);


                        var isPaint = false;
                        var mode = componentState.drawMode;
                        var lastLine;

                        aiFillMaskLayer?.setAttrs({ visible: true });
                        aiFillMaskLayer.off('mousedown touchstart mouseup touchend mousemove touchmove');
                        aiFillMaskLayer.on('mousedown touchstart', function (e) {
                            isPaint = true;
                            let pos = componentState.stage.getRelativePointerPosition();
                            lastLine = new Konva.Line({
                                stroke: document.querySelector('input[name="mask-direction-radio"]:checked').value === 'brush' || 1 ? '#ffffff' : '#ffffff',
                                strokeWidth: 30,
                                globalCompositeOperation:
                                    document.querySelector('input[name="mask-direction-radio"]:checked').value === 'brush' ? 'source-over' : 'destination-out',
                                lineCap: 'round',
                                lineJoin: 'round',
                                points: [pos.x, pos.y, pos.x, pos.y],
                            });
                            aiFillMaskClipperGroup.add(lastLine);
                        });

                        aiFillMaskLayer.on('mouseup touchend', function () {
                            isPaint = false;
                            mode = componentState.drawMode;
                            console.log('mode', mode);
                        });

                        // and core function - drawing
                        aiFillMaskLayer.on('mousemove touchmove', function (e) {
                            if (!isPaint) {
                                return;
                            }
                            // prevent scrolling on touch devices
                            e.evt.preventDefault();

                            let pos = componentState.stage.getRelativePointerPosition();

                            // if (!(pos.x > 0 && pos.y > 0 && pos.x < componentState.currentImage.width && pos.y < componentState.currentImage.height))
                            //     return;
                            var newPoints = lastLine.points().concat([pos.x, pos.y]);
                            lastLine.points(newPoints);
                        });
                    }
                    if (componentState.step == 'bg-mask-setting') {
                        let canvasControls = [
                            [
                                <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                                    onClick={() => { setComponentState((p) => ({ ...p, step: 'bg-mask-setting-apply' })) }}>
                                    <i className="fi fi-rr-check"></i>
                                    <div className="text-xs">Apply</div>
                                </div>,
                                <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                                    onClick={() => { setComponentState((p) => ({ ...p, step: 'bg-mask-setting-cancel' })) }}>
                                    <i className="fi fi-rr-cross"></i>
                                    <div className="text-xs">Cancel</div>
                                </div>,
                                <ul class="flex h-full dark:bg-neutral-800 rounded dark:hover:bg-neutral-700 cursor-pointer overflow-hidden">
                                    <li className="has-[:checked]:bg-blue-500 w-full border-b border-gray-200 sm:border-b-0 dark:border-gray-600 flex sm:border-r">
                                        <label for="horizontal-list-radio-license" class="flex items-center px-3 gap-2">
                                            <input id="horizontal-list-radio-license" type="radio" value="brush" name="mask-direction-radio" class="hidden" defaultChecked={componentState.drawMode == 'brush'} onChange={(e) => log(1, e.target.value) && (e.target.checked ? (setComponentState((p) => ({ ...p, drawMode: e.target.value }))) : null)} />
                                            <div className="text-xs">Add</div>
                                        </label>
                                    </li>
                                    <li className="has-[:checked]:bg-blue-500 w-full border-b border-gray-200 sm:border-b-0 dark:border-gray-600 flex">
                                        <label for="horizontal-list-radio-id" class="flex items-center px-3 gap-2">
                                            <input id="horizontal-list-radio-id" type="radio" value="eraser" name="mask-direction-radio" class="hidden" defaultChecked={componentState.drawMode == 'eraser'} onChange={(e) => log(1, e.target.value) && (e.target.checked ? (setComponentState((p) => ({ ...p, drawMode: e.target.value }))) : null)} />
                                            <div className="text-xs">Subtract</div>
                                        </label>
                                    </li>
                                </ul>
                            ]
                        ];
                        setComponentState((p) => ({ ...p, canvasControls }));
                        componentState.stage.find('#main-image')?.[0]?.image(componentState.originalImage);


                        let layer = componentState.stage.find('#mask-image-layer')?.[0];

                        let maskClipperGroup = componentState.stage.find('#mask-clipper-group')?.[0];
                        var isPaint = false;
                        var mode = componentState.drawMode;
                        var lastLine;

                        layer?.setAttrs({ visible: true });
                        layer.off('mousedown touchstart mouseup touchend mousemove touchmove');
                        layer.on('mousedown touchstart', function (e) {
                            isPaint = true;
                            let pos = componentState.stage.getRelativePointerPosition();
                            lastLine = new Konva.Line({
                                stroke: document.querySelector('input[name="mask-direction-radio"]:checked').value === 'brush' || 1 ? '#000000' : '#ffffff',
                                strokeWidth: 30,
                                globalCompositeOperation:
                                    document.querySelector('input[name="mask-direction-radio"]:checked').value === 'brush' ? 'source-over' : 'destination-out',
                                lineCap: 'round',
                                lineJoin: 'round',
                                points: [pos.x, pos.y, pos.x, pos.y],
                            });
                            maskClipperGroup.add(lastLine);
                        });

                        layer.on('mouseup touchend', function () {
                            isPaint = false;
                            mode = componentState.drawMode;
                            console.log('mode', mode);
                        });

                        // and core function - drawing
                        layer.on('mousemove touchmove', function (e) {
                            if (!isPaint) {
                                return;
                            }
                            // prevent scrolling on touch devices
                            e.evt.preventDefault();

                            let pos = componentState.stage.getRelativePointerPosition();

                            // if (!(pos.x > 0 && pos.y > 0 && pos.x < componentState.currentImage.width && pos.y < componentState.currentImage.height))
                            //     return;
                            var newPoints = lastLine.points().concat([pos.x, pos.y]);
                            lastLine.points(newPoints);
                        });
                    }
                    if (componentState.step == 'bg-removal-ongoing') {
                        let layer = componentState.stage.find('#main-layer')[0];
                        let sourceImgGroup = layer.find('#source-image-group')[0];
                        setComponentState((p) => ({ ...p, loading: true }));
                        console.log('started bg removal');
                        let blb = await getBlobFromImage(await getImageFromURL(URL.createObjectURL(imageFile)))
                        let [resultImageUrl, resultMaskUrl] = await apis.removeBg(blb);
                        console.log('done bg removal', resultImageUrl, resultMaskUrl);
                        let bgRemovedImage = await getImageFromBlob(await downloadImageBlobFromUrl(resultImageUrl));
                        console.log('img', bgRemovedImage);
                        let mainImageGroup = new Konva.Group({
                            id: 'main-image-group',
                            clip: {
                                x: 0,
                                y: 0,
                                width: bgRemovedImage.width,
                                height: bgRemovedImage.height,
                            },
                        });
                        mainImageGroup.add(new Konva.Image({
                            image: bgRemovedImage,
                            x: 0,
                            y: 0,
                            // width: bgRemovedImage.width * (componentState.stage.height() / bgRemovedImage.height),
                            // height: componentState.stage.height(),
                            width: bgRemovedImage.width,
                            height: bgRemovedImage.height,
                            id: 'main-image'
                        }))
                        layer.add(mainImageGroup);
                        // rescale stage
                        let maskLayer = new Konva.Layer({
                            id: 'mask-image-layer',
                            visible: false,
                            x: 0,
                            y: 0,
                            width: bgRemovedImage.width,
                            height: bgRemovedImage.height
                        });
                        let maskClipperGroup = new Konva.Group({
                            id: 'mask-clipper-group',
                            clip: {
                                x: 0,
                                y: 0,
                                width: bgRemovedImage.width,
                                height: bgRemovedImage.height,
                            },
                        });
                        maskClipperGroup.add(new Konva.Image({
                            image: await convertWhiteToAlpha(await getImageFromURL(resultMaskUrl)),
                            x: 0,
                            y: 0,
                            width: bgRemovedImage.width,
                            height: bgRemovedImage.height,
                            id: 'mask-image'
                        }));
                        maskLayer.add(maskClipperGroup)
                        componentState.stage.add(maskLayer);

                        layer.draw();
                        componentState.stage.draw();
                        setComponentState((p) => ({ ...p, loading: false, step: 'bg-removal-done', currentImage: bgRemovedImage }));
                        let shrinkInterval = setInterval(() => {
                            let height = sourceImgGroup.clip().height;
                            if (height <= 0.1) {
                                clearInterval(shrinkInterval);
                                console.log("Animation complete!");
                            } else {
                                sourceImgGroup.setAttrs({
                                    clip: {
                                        x: 0,
                                        y: 0,
                                        width: componentState.stage.width(),
                                        height: height - (componentState.stage.height() / 60),
                                    },
                                });
                                layer.batchDraw();
                            }
                        }, 1000 / 60);
                        return;
                    }
                } catch (error) {
                    console.log(error);
                    setComponentState((p) => ({ ...p, loading: false, step: 'error' }));
                }
            })();
        }, [componentState.step]);
        function getHeaderFromStep(step) {
            let stateToHeader = {
                'bg-removal-ongoing': 'Background Removal',
                'bg-mask-setting': 'Background Removal',
                'ai-fill-setup': 'AI Fill',
                'ai-fill-generating': 'AI Fill',
                'ai-fill-cancel': 'Processing',
                'ai-fill-apply': 'Processing',
                'bg-mask-setting-cancel': 'Processing',
                'bg-mask-setting-apply': 'Processing',
            };
            return stateToHeader[step] || 'Edit';
        }
        return (
            <div className="p-4 flex flex-col items-start h-full overflow-auto">
                <div className="header text-2xl font-bold dark:text-white">{getHeaderFromStep(componentState.step)}</div>
                <div className="my-2"></div>
                <div className={`border flex flex-col items-center w-full shrink-0 aspect-video ${componentState.loading ? ' loading overflow-hidden ' : ''}`}
                    ref={divRef}>
                    <div className="konva-canvas w-full h-full"></div>
                </div>

                <div className="flex flex-col w-full">
                    {componentState.canvasControls.length ? componentState.canvasControls.map((row, i) => <div key={i} className="canvas-controls w-full overflow-auto p-2 dark:bg-neutral-700 flex gap-2">{row.map((c, i) => c)}</div>) : null}
                </div>

                <div className="my-2"></div>
                <div className="text-xl font-bold dark:text-white">Background Removal</div>
                <div className="my-2"></div>

                <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                    onClick={() => { setComponentState((p) => ({ ...p, step: 'bg-mask-setting' })) }}>
                    <i className="fi fi-rr-copy-image"></i>
                    <div className="text-xs">Remove BG</div>
                </div>

                <div className="my-2"></div>
                <div className="text-xl font-bold dark:text-white">AI Tools</div>
                <div className="my-2"></div>
                <div className="flex gap-2">
                    <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => { setComponentState((p) => ({ ...p, step: 'ai-fill-setup' })) }}>
                        <i className="fi fi-rr-sparkles"></i>
                        <div className="text-xs">Fill Selection</div>
                    </div>
                </div>


                <div className="my-2"></div>
                <div className="text-xl font-bold dark:text-white">Templates</div>
                <div className="my-2"></div>
                <div className="flex gap-2">
                    <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => { setComponentState((p) => ({ ...p, step: 'bg-mask-setting' })) }}>
                        <img className="w-20 aspect-video" src={`https://picsum.photos/seed/${Math.random()}/200/300`} alt="" />
                    </div>
                    <div className="flex flex-col items-center dark:bg-neutral-800 p-2 gap-1 rounded dark:hover:bg-neutral-700 cursor-pointer"
                        onClick={() => { setComponentState((p) => ({ ...p, step: 'bg-mask-setting' })) }}>
                        <img className="w-20 aspect-video" src={`https://picsum.photos/seed/${Math.random()}/200/300`} alt="" />
                    </div>
                </div>

            </div>
        )
    }
    async function subtractMaskFromImage(baseImage, maskImage, width, height) {
        // Create an offscreen canvas
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;  // Set canvas width
        offscreenCanvas.height = height; // Set canvas height
        const ctx = offscreenCanvas.getContext('2d');

        // Draw the base image onto the canvas
        baseImage = baseImage;
        maskImage = maskImage;
        ctx.drawImage(baseImage, 0, 0, width, height);
        const baseImageData = ctx.getImageData(0, 0, width, height); // Get base image pixel data

        // Clear the canvas for mask
        ctx.clearRect(0, 0, width, height);

        // Draw the mask image onto the canvas
        ctx.drawImage(maskImage, 0, 0, width, height);
        const maskImageData = ctx.getImageData(0, 0, width, height); // Get mask image pixel data

        // Prepare the resulting image data
        const resultImageData = ctx.createImageData(width, height);

        // Iterate through each pixel
        for (let i = 0; i < baseImageData.data.length; i += 4) {
            // Base image RGBA
            const r = baseImageData.data[i];
            const g = baseImageData.data[i + 1];
            const b = baseImageData.data[i + 2];
            const a = baseImageData.data[i + 3];

            // Mask image RGB (calculate intensity from grayscale)
            const maskR = maskImageData.data[i];
            const maskG = maskImageData.data[i + 1];
            const maskB = maskImageData.data[i + 2];
            const maskIntensity = (maskR + maskG + maskB) / 3; // Average RGB for grayscale

            // Subtract the mask effect (black reduces alpha, white keeps it)
            const maskAlpha = (maskIntensity / 255) * 255; // Normalize intensity to alpha
            resultImageData.data[i] = r; // Keep red channel
            resultImageData.data[i + 1] = g; // Keep green channel
            resultImageData.data[i + 2] = b; // Keep blue channel
            resultImageData.data[i + 3] = Math.max(0, maskAlpha); // Subtract mask alpha from base alpha
        }

        // Apply the resulting image data back to the canvas
        ctx.putImageData(resultImageData, 0, 0);

        // Return the offscreen canvas for use in a Konva.Image
        let res = await getImageFromURL(offscreenCanvas.toDataURL());
        console.log('masked', res.width, res.height);
        return res;
    }
    function convertAlphaToWhite(image) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = 255 - imageData.data[i + 3];
                imageData.data[i + 1] = 255 - imageData.data[i + 3];
                imageData.data[i + 2] = 255 - imageData.data[i + 3];
                imageData.data[i + 3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(await getImageFromCanvas(canvas));
        })
    }
    function convertWhiteToAlpha(image) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {

                const grayscale = imageData.data[i]; // R channel (same as G and B for grayscale images)

                // Set alpha channel based on grayscale value
                imageData.data[i + 3] = 255 - grayscale; // Alpha = brightness

                // Optional: Clear RGB channels to leave only transparency
                imageData.data[i] = 0; // R
                imageData.data[i + 1] = 0; // G
                imageData.data[i + 2] = 0; // B

            }
            ctx.putImageData(imageData, 0, 0);
            resolve(await getImageFromCanvas(canvas));
        })
    }
    function invertAlpha(image) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i + 3] = imageData.data[i + 3] == 0 ? 255 : 0;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(await getImageFromCanvas(canvas));
        })
    }
    function imprintOnImage(image, image2) {
        return new Promise(async (resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            ctx.drawImage(image2, 0, 0);
            resolve(await getImageFromCanvas(canvas));
        })
    }
    return Component;
})()