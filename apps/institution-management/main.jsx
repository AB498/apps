(async () => {

    await poll(() => window.PocketBase);



    const { BrowserRouter, HashRouter, Link, Route, Switch: Routes, useHistory, useLocation, useParams, useRouteMatch } = ReactRouterDOM;
    const { useState, useEffect, useRef, createContext, useContext, useMemo, isValidElement } = React;
    function useQuery() {
        const { search } = useLocation();
        return React.useMemo(() => Object.fromEntries([...new URLSearchParams(search)]), [search]); // q.get("name")
    }
    const useBeforeMount = (func) => {
        const hasMounted = React.useRef(false);
        if (!hasMounted.current) {
            func();
            hasMounted.current = true;
        }
    };


    // const store = new PocketBase.AsyncAuthStore({
    //     save: async (serialized) => localStorage.setItem('pb_auth', serialized),
    //     initial: localStorage.getItem('pb_auth'),
    // });

    const pb = new PocketBase.default('http://139.99.88.81:8090'); // ,store
    window.pb = pb;

    function App() {
        let [user, setUser] = useState(pb.authStore.model);

        let history = useHistory();

        window.navigate = (path) => {
            history.push(path);
        };

        useEffect(() => {
            pb.authStore.onChange(() => {
                setUser(pb.authStore.model);
            });
        }, []);

        if (!user) return <AuthPage />
        return (
            <Layout topBar={<TopBar />} content={<Content />} sideBar={<SideBar />} />
        )
    };

    function TopBar() {
        useEffect(() => {
            initFlowbite();
        }, [])
        return (
            <div className="flex items-center w-full p-4 border gap-4">
                <div class="text-center">
                    <button class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full aspect-square text-sm w-10 h-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="button" data-drawer-target="drawer-example" data-drawer-show="drawer-example" aria-controls="drawer-example">
                        <i class="fi fi-rr-bars-staggered"></i>
                    </button>
                </div>

                <div id="drawer-example" class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-label">
                    <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"><svg class="w-4 h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                    </svg>Info</h5>
                    <button type="button" data-drawer-hide="drawer-example" aria-controls="drawer-example" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Close menu</span>
                    </button>

                    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="#" class="text-blue-600 underline dark:text-blue-500 hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p>
                    <div class="grid grid-cols-2 gap-4">
                        <a href="#" class="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
                        <a href="#" class="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Get access <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg></a>
                    </div>
                </div>
                {/* sidebar end */}

                <div className="grow"></div>
                <label class="flex items-center cursor-pointer">
                    <input type="checkbox" value="" class="sr-only peer" defaultChecked={localStorage.getItem('color-theme') == 'dark'} onChange={() => setTheme(localStorage.getItem('color-theme') == 'dark' ? 'light' : 'dark')} />
                    <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>

                <button class="flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full aspect-square text-sm w-10 h-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="button" data-drawer-target="drawer-example" data-drawer-show="drawer-example" aria-controls="drawer-example">
                    <i class="flex fi fi-rr-exit" onClick={() => pb.authStore.clear()}></i>
                </button>
            </div>
        )
    }

    function AuthPage() {
        const history = useHistory();
        if (history.location.pathname === '/') navigate('/auth/login');
        return (
            <div className="flex md:flex-row flex-col h-screen">
                <div className="w-full md:w-1/2 border-r">
                </div>
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                    <Routes>
                        <Route path="/auth/login" ><LoginPage /></Route>
                        <Route path="/auth/register" ><RegisterPage /></Route>
                    </Routes>
                </div>
            </div>
        );
    }
    function LoginPage() {
        async function login(e) {
            e.preventDefault();
            let email = document.querySelector('input[name="email"]').value;
            let password = document.querySelector('input[name="password"]').value;

            try {
                const user = await pb.collection('users').authWithPassword(email, password);
                console.log({ username: username, email: email, password: password });
                console.log('user', user);
            } catch (error) {
                console.log(error)
                console.log(error?.data || 'Unknown error');
            }
        }

        return (
            <div className="flex flex-col">

                <div className="bg-base-200 w-full max-w-[200px] flex items-center justify-center rounded-full aspect-square mx-auto shadow">
                    <i class="text-8xl fi fi-rr-user"></i>
                </div>
                <div className="my-2"></div>
                <div className="text-3xl font-bold mx-auto">Sign in</div>
                <div className="my-2"></div>
                <div className="max-w-sm flex flex-col gap-2 mx-auto">
                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                        <input type="text" class="grow" name="email" placeholder="Email" />
                    </label>
                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" /></svg>
                        <input type="password" class="grow" name="password" placeholder="Password" />
                    </label>
                    <button class="btn btn-primary w-full" onClick={login}>Login</button>

                    <div className="my-2"></div>
                    <div className="text-sm text-center">
                        Don't have an account? <a className="special-link" onClick={e => { e.preventDefault(); navigate('/auth/register'); }}>Register</a>
                    </div>
                </div>
            </div>
        );
    }
    function RegisterPage() {

        async function register(e) {
            e.preventDefault();
            let email = document.querySelector('input[name="email"]').value;
            let password = document.querySelector('input[name="password"]').value;
            let username = document.querySelector('input[name="username"]').value || email.split('@')[0];

            try {

                await pb.collection('users').create({ username: username, email: email, password: password, passwordConfirm: password });
                const user = await pb.collection('users').authWithPassword(email, password);
                // pb.authStore.save(user.token, user.record);
                console.log({ username: username, email: email, password: password });
                console.log('user', user);
            } catch (error) {
                console.log(error)
                console.log(error?.data || 'Unknown error');
            }
        }
        return (
            <div className="flex flex-col">

                <div className="bg-base-200 w-full max-w-[200px] flex items-center justify-center rounded-full aspect-square mx-auto shadow">
                    <i class="text-8xl fi fi-rr-user"></i>
                </div>
                <div className="my-2"></div>
                <div className="text-3xl font-bold mx-auto">Sign in</div>
                <div className="my-2"></div>
                <div className="max-w-sm flex flex-col gap-2 mx-auto">
                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                        <input type="text" name="username" class="grow" placeholder="Username" />
                    </label>
                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                        <input type="text" name="email" class="grow" placeholder="Email" />
                    </label>
                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path fill-rule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clip-rule="evenodd" /></svg>
                        <input type="password" name="password" class="grow" placeholder="Password" />
                    </label>
                    <button class="btn btn-primary w-full" onClick={register}>Register</button>

                    <div className="my-2"></div>
                    <div className="text-sm text-center">
                        Already have an account? <a className="special-link" onClick={e => { e.preventDefault(); navigate('/auth/login'); }}>Login</a>
                    </div>
                </div>
            </div>
        );
    }
    function Content() {
        return (
            <div className="flex justify-center items-center h-full w-full px-4 border">

            </div>
        )
    }
    function SideBar() {
        return (
            <div className="flex flex-col items-center h-full p-4 border">

            </div>
        )
    }

    function Layout() {
        return (
            <div className="flex flex-col h-screen w-screen border bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ">
                <TopBar />
                <div className="flex flex-1">
                    <SideBar />
                    <Content />
                </div>
            </div>
        )
    };

    ReactDOM.createRoot(document.getElementById('root')).render(
        <HashRouter > {/* basename="/apps/institution-management" */}
            <Routes>
                <Route path="/"><App /></Route>
            </Routes>
        </HashRouter>
    );

})();