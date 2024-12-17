(() => {
    let uuid = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    let poll = async (fn, t, breakTimeout) => {
        let canceller;
        let ended = false;
        if (breakTimeout) {
            canceller = setTimeout(() => {
                console.log("Timeout");
                ended = true;
                return;
            }, breakTimeout);
        }
        while (!ended) {
            let res = await fn();
            if (res) {
                canceller && clearTimeout(canceller);
                return res;
            }
            await new Promise((r) => setTimeout(r, t || 200));
        }
    };


    const { useState, useMemo, useEffect, createContext, useContext, useRef } = window.React;
    let transform = window.sucrase ? (code) => window.sucrase.transform(code, { transforms: ['jsx'] }).code : (code) => window.Babel.transform(code, { presets: ['react'] }).code;

    function useAsync(asyncFn) {
        let [data, setData] = useState(null);
        let [error, setError] = useState(null);
        useEffect(() => {
            asyncFn().then(setData).catch(setError);
        }, []);
        (error && console.log('useAsync Error', error));
        return [data, setData, error];
    }
    function useStream(fn, cb, cleanup) {
        let [data, setData] = useState();
        useEffect(() => {
            (async () => {
                setData((await cb()));
                fn(async () => {
                    setData((await cb()));
                });
            })();

            return () => cleanup && cleanup();
        }, []);
        return [data, setData];
    }

    let subscribeFnSync = (changableAsyncFn, asyncCallback) => {
        let oldRes = null;
        let running = true;
        (async () => {
            while (running) {
                let res = await changableAsyncFn();
                if (oldRes != res) {
                    oldRes = res;
                    if (!running) break;
                    await asyncCallback(res);
                }
                oldRes = res;
                await new Promise((r) => setTimeout(r, 500));
            }
            // console.log('Unsubscribed');
        })();
        return () => { running = false };
    }
    let AsyncComponent = (props) => {
        let { asyncFn, children, resultProcessorFn } = props || {};
        let data = useRef(null);
        let forceUpdate = useForceUpdate();
        useEffect(() => {
            asyncFn().then(
                (res) => {
                    data.current = resultProcessorFn ? resultProcessorFn(res, props) : res;
                    forceUpdate();
                }
            )
        }, [asyncFn, resultProcessorFn]);

        return data.current ? data.current : '[ NULL ]';
    }
    let StreamComponent = (props) => {
        let { subscriberFn, children, resultProcessorFn } = props || {};
        let data = useRef(null);
        let unsub = useRef(null);
        let forceUpdate = useForceUpdate();
        useEffect(() => {
            if (unsub.current) unsub.current();
            let updatedResultProcessorFn = (res) => {
                data.current = resultProcessorFn ? resultProcessorFn(res, props) : res;
                forceUpdate();
            };
            let unsubs = subscriberFn(updatedResultProcessorFn);
            unsub.current = unsubs;
        }, [subscriberFn, resultProcessorFn]);
        return data.current ? data.current : '[ NULL ]';

    }
    let RealtimeComponent = (props) => {
        let { path } = props;
        let originalPath = path;
        let fn = async () => {
            let resp = await fetch(path);
            if (!resp.ok) {
                let originalPath = path;
                path = properPath('components/404.jsx');
                return `()=><div></div>`;
            }
            return (await resp.text());
        };
        return (
            <StreamComponent {...props} subscriberFn={
                (resultProcessorFn) => subscribeFnSync(fn, resultProcessorFn)
            } resultProcessorFn={(res, props) => {
                try {
                    let Comp = eval(transform(res));
                    return <Comp {...props} uuid={uuid()} {...(path == properPath('components/404.jsx') && { children: originalPath })} />
                } catch (error) {
                    return <div>{error + ' ' + res}</div>
                }
            }} />
        )
    }
    function MakeComponent({ func: Func, props, stateful = true }) {
        if (!stateful) return <Func {...props} />;
        let stateFullComponent = useRef(null);
        let forceUpdate = useForceUpdate();
        useEffect(() => {
            stateFullComponent.current = <Func {...props} />;
            forceUpdate();
        }, []);
        return stateFullComponent.current;
    }

    function useForceUpdate() {
        let [, set] = useState(0);
        return () => set((i) => i + 1);
    }

    async function importModule(src) {
        let content = await (await fetch(src + '?t=' + Date.now())).text();
        if (src.slice(-3) == ".js" || src.slice(-4) == ".jsx") return eval(transform(`${content}`));
        if (src.slice(-3) == ".css") document.body.insertAdjacentHTML("beforeend", `<style>${content}</style>`);
    }
    function isJSONObject(obj) {
        if ([Date, RegExp, Error].some((t) => obj instanceof t) || Array.isArray(obj)) {
            return false;
        }
        try {
            JSON.stringify(obj);
            return obj && typeof obj == "object";
        } catch (e) {
            return false;
        }
    }

    function makeReactive(obj, setter) {
        let mutatingArrayFunctions = ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
        let handler = {
            get: function (target, prop) {
                if (prop == "__isReactive") return true;
                return target[prop];
            },
            set: function (target, prop, value) {
                target[prop] = value;
                target[prop] = makeReactive(value, setter);
                // console.log("set", prop, value, target);
                if (!prop.startsWith("_")) setter();
                return true;
            },
        };
        if (!isJSONObject(obj) && !Array.isArray(obj)) {
            return obj;
        }
        let newObj = {};
        if (Array.isArray(obj)) {
            newObj = [];
        }
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = makeReactive(value, setter);
        }
        return new Proxy(newObj, handler);
    }

    let reactive = (obj) => {
        let [state, setState] = useState(obj);
        state = makeReactive(state, () => setState(state));
        return state;
    };

    function useBreakpoint() {
        const [breakpoint, setBreakpoint] = useState(handleResize());

        function handleResize() {
            const width = window.innerWidth;
            return {
                sm: width >= 640,
                md: width >= 768,
                lg: width >= 1024,
                xl: width >= 1280,
            };
        };
        useEffect(() => {

            let handler = () => setBreakpoint(handleResize());
            window.addEventListener("resize", handler);

            return () => window.removeEventListener("resize", handler);
        }, []);

        return breakpoint;
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
    async function getImageFromURL(url) {
        return await getImageFromBlob(await downloadImageBlobFromUrl(url));
    }

    async function getBlobFromImage(image) {
        // let blob = await downloadImageBlobFromUrl(image.src);
        // image = await getImageFromBlob(blob);
        // return image;
        return new Promise(async (resolve, reject) => {
            image = await getImageFromBlob(await downloadImageBlobFromUrl(image.src));
            let canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
        })

    }
    function cropImage(image, x, y, width, height) {
        // Assuming the function should crop a given image to a specific area
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height, x, y, width, height);

            canvas.toBlob(async (blob) => {
                resolve(await getImageFromBlob(blob));
            }, 'image/png');
        });

    }
    async function getImageFromCanvas(canvas) {
        return await getImageFromURL(canvas.toDataURL("image/png"));
    }
    function getImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            let image = new Image(); // Create a new Image object

            // Handle the onload event
            image.onload = function () {
                resolve(image); // Resolve the Promise with the loaded Image object
            };

            // Handle errors
            image.onerror = function () {
                reject(new Error("Failed to load image from blob"));
            };

            // Generate a URL for the blob and set it as the image source
            let blobURL = URL.createObjectURL(blob);
            image.src = blobURL;
        });
    }

    async function downloadImageBlobFromUrl(url) { return await fetch(url).then((r) => r.blob()); }
    // export default { ... }
    let modules = {
        safe, uuid, useAsync, useForceUpdate, poll, useStream, subscribeFnSync,
        MakeComponent, getImageFromURL, getImageFromBlob, getBlobFromImage, downloadImageBlobFromUrl, cropImage, getImageFromCanvas,
        RealtimeComponent, AsyncComponent, StreamComponent, makeReactive, reactive, useBreakpoint, isJSONObject
    };
    Object.keys(modules).forEach((key) => {
        window[key] = modules[key];
    })
    return modules;
})()