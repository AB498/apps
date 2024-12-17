(async () => {

    let APP_PREFIX = 'img';
    let APP_ASSETS_PREFIX = 'assets';

    function properPath(path) {
        return join('/', APP_PREFIX, path);
    }
    function join(...paths) {
        return paths
            .map(path => path.replace(/\/+$/, '')) // Remove trailing slashes
            .join('/')
            .replace(/\/+/g, '/'); // Replace multiple slashes with a single slash
    }

    function log(...args) {
        console.log(...args)
        return args[args.length - 1];

    }


    let transform = window.sucrase ? (code) => window.sucrase.transform(code, { transforms: ['jsx'] }).code : (code) => window.Babel.transform(code, { presets: ['react'] }).code;

    async function importModule(src, cache = 0) {
        try {
            let content = '';
            if (cache) {
                let fetched = await localStorage.getItem(src);
                // console.log('fromcache', fetched);
                if (!fetched) {
                    fetched = await (await fetch(src + '?t=' + Date.now())).text()
                    await localStorage.setItem(src, fetched);
                }
                content = fetched;
            } else {
                content = await (await fetch(src + '?t=' + Date.now())).text();
            }
            if (src.slice(-3) == ".js" || src.slice(-4) == ".jsx") return eval(transform(`${content}`));
            if (src.slice(-4) == ".css") document.body.insertAdjacentHTML("beforeend", `<style>${content}</style>`);
        } catch (error) {
            console.error(src, error);
        }
    }
    window.importModule = importModule;

    async function doOnce() {
        let starttime = Date.now();
        await Promise.all([
            // importModule(properPath('assets/css/fa.css'), 1),
            // importModule(properPath('assets/css/uicons-regular-rounded.css'), 1),
            importModule(properPath('assets/js/alertify.min.js'), 1),
            importModule(properPath('assets/css/alertify.min.css'), 1),
            importModule(properPath('assets/js/tailwind.js'), 1),
            importModule(properPath('assets/js/pocketbase.umd.min.js'), 1),
        ]);
        await importModule(properPath('assets/js/react.development.js'), 1);
        await importModule(properPath('assets/js/react-dom.development.js'), 1);
        await importModule(properPath('assets/js/react-router-dom.min.js'), 1);
        await importModule(properPath('assets/js/utils.js'));
        console.log('loaded in ' + (Date.now() - starttime) + 'ms');
    }

    if (!window.doneOnce) {
        await doOnce();
        window.doneOnce = true;
    }
    const { safe, uuid, useAsync, useForceUpdate, poll, useStream, subscribeFnSync, RealtimeComponent, AsyncComponent, StreamComponent, makeReactive, reactive, useBreakpoint, isJSONObject } = await importModule(properPath('utils.js'));
    const { useState, useMemo, useEffect, createContext, useContext, useRef } = window.React;
    const { HashRouter, Route, Switch, Redirect, useHistory, useLocation, Link } = window.ReactRouterDOM;

    const StateContext = createContext(); // global state
    function Providers({ children }) {
        // localStorage["state"] = localStorage["state"] || "{}";
        const state = reactive(JSON.parse(localStorage.getItem("state") || "{}"));
        useEffect(() => { localStorage["state"] = JSON.stringify(state) }, [state]);
        window.state = state;
        // let breakpoint = useBreakpoint();
        // window.breakpoint = breakpoint;
        return (
            <HashRouter>
                <StateContext.Provider value={[state]}>
                    {children}
                </StateContext.Provider>
            </HashRouter>
        );

    }

    function Helpers({ children }) {
        // useContext(StateContext);
        useLocation();
        let history = useHistory();
        window.navigate = (path) => history.push(path);
        return children;
    }


    let App = () => {
        let { state } = window;
        // useContext(StateContext);
        if (!state) return;

        // useEffect(() => {
        //     navigate('/home/student/dashboard');
        // }, [state]);

        let location = useLocation();

        return (
            <div className="bg-neutral-900 text-white h-screen border-4 mx-auto aspect-[9/16]">
                {/* APP */}
                <Switch>
                    <Route exact path="/"><RealtimeComponent path={properPath('components/auth.jsx')} /> </Route>
                    <Route path="/home"><RealtimeComponent path={properPath('components/home.jsx')} /> </Route>
                </Switch>
                {
                    // !state.user
                    //     ? <RealtimeComponent path={properPath('components/auth.jsx')} />
                    //     : <RealtimeComponent path={properPath('components/home.jsx')} >
                    //         {/* HOME */}
                    //         {state.user.type != 'teacher'
                    //             ? <RealtimeComponent path={properPath('components/student.jsx')} >
                    //                 {/* STUDENT */}
                    //                 {location.pathname}
                    //             </RealtimeComponent>
                    //             : <RealtimeComponent path={properPath('components/teacher.jsx')} />}

                    //     </RealtimeComponent>
                }
            </div>
        )
    }



    let render = () => {
        const container = document.querySelector("#root") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "root" }));
        window.root = window.ReactDOM.createRoot(container);
        window.root.render(
            <div>
                <Providers>
                    <Helpers>
                        <Link to="/" viewTransition>Start</Link>
                        <Link to="/home" viewTransition>Home</Link>
                        <App />
                    </Helpers>
                </Providers>
            </div>
        );
    }

    window.render = render;

    if (!window.selfReloadSubscribed) {
        window.selfReloadSubscribed = true;
        subscribeFnSync(async () => {
            return await (await fetch(properPath('main.jsx'))).text();
        }, async (res) => {
            if (window.root) window.root.unmount();
            await safe(async () => {
                await eval(transform(res));
                window.render();
            });
            console.log("main.jsx loaded");
        });
    }




    await poll(() => window.gradioclient);
    let { client: Client, handle_file } = gradioclient;
    window.Client = Client;


    let apis = {
        async removeBg(imageBlob) {
            let client = await Client("ECCV2022/dis-background-removal");
            let result = await client.predict("/predict", {
                image: imageBlob,
            });
            return [result.data[0].url, result.data[1].url]; // [removed, mask]
        },
        async flux(image, mask, composite, prompt) {
            let imageBlob = await getBlobFromImage(image);
            let maskBlob = await getBlobFromImage(mask);
            let compositeBlob = await getBlobFromImage(composite);
            let client = await Client("black-forest-labs/FLUX.1-Fill-dev", { hf_token: "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" });
            let result = await client.predict("/infer", {
                edit_images: { "background": imageBlob, "layers": [maskBlob], "composite": compositeBlob },
                prompt: prompt,
                seed: 0,
                randomize_seed: true,
                width: image.width,
                height: image.height,
                guidance_scale: 30,
                num_inference_steps: 30,
            });
            return result.data[0].url; // filled
        },
        async stableDiffusion(prompt = "", negative_prompt = "") {
            const client = await Client("stabilityai/stable-diffusion");
            const result = await client.predict("/infer", {
                prompt,
                negative: negative_prompt,
                scale: 0,
            });

            return result.data[0];
        },
        async stableDiffusion2(prompt = "", negative_prompt = "") {
            const client = await Client("stabilityai/stable-diffusion-3-medium");
            const result = await client.predict("/infer", {
                prompt,
                negative_prompt,
                seed: 0,
                randomize_seed: true,
                width: 256,
                height: 256,
                guidance_scale: 0,
                num_inference_steps: 1,
            });
            return result.data[0];
        }
    };
    window.apis = apis;


})()



