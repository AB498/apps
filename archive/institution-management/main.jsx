(async () => {

    await poll(() => window.PocketBase);
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }



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

    const pb = new PocketBase.default('http://world.ovh/pb'); // ,store
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

        return <div className="text-black bg-white dark:bg-black dark:text-white">{user ? (
            <Layout topBar={<TopBar />} content={<Content />} sideBar={<SideBar />} />
        ) : (<AuthPage />)}
        </div>;
    };

    function TopBar() {
        useEffect(() => {
            initFlowbite();
        }, [])
        return (
            <div className="flex items-center w-full gap-4 p-4 border">
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

                <button class="flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full aspect-square text-sm w-10 h-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" type="button"
                    onClick={() => pb.authStore.clear()}>
                    <i class="flex fi fi-rr-exit"></i>
                </button>
            </div>
        )
    }

    function AuthPage() {
        const history = useHistory();
        if (history.location.pathname === '/') navigate('/auth/login');
        return (
            <div className="flex flex-col h-screen md:flex-row">
                <div className="w-full border-r md:w-1/2">
                    <img src="https://picsum.photos/200/300?grayscale&blur=2" alt="" className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col justify-center w-full p-10 md:w-1/2">
                    <Routes>
                        <Route path="/auth/login" ><LoginPage /></Route>
                        <Route path="/auth/register" ><RegisterPage /></Route>
                    </Routes>
                </div>
            </div>
        );
    }

    function getAbsoluteHeight(el) {
        // Get the DOM Node if you pass in a string
        el = (typeof el === 'string') ? document.querySelector(el) : el;

        var styles = window.getComputedStyle(el);
        var margin = parseFloat(styles['marginTop']) +
            parseFloat(styles['marginBottom']);

        return Math.ceil(el.offsetHeight + margin);
    }

    function ErrorDiv({ error }) {
        let [height, setHeight] = useState(0);
        let ref = useRef();

        useEffect(() => {
            setHeight(getAbsoluteHeight(ref.current));
        }, [error]);
        return (
            <>
                <div ref={ref} className="absolute invisible w-full p-2 overflow-hidden text-center text-red-500 bg-red-100 border rounded dark:bg-red-900 dark:text-red-100">{error}</div>
                <div className={`text-center text-red-500 rounded overflow-hidden bg-red-100 dark:bg-red-900 dark:text-red-100 transition-all duration-300 ${error ? ('border border-red-500 p-2 h-[' + height + 'px]') : ('border-0 p-0 h-[0px]')}`} onScroll={(e) => setHeight(getAbsoluteHeight(ref.current))}>{error}</div>
            </>
        )
    }
    function LoginPage() {
        async function login(e) {
            e.preventDefault();
            setLoadings({ ...loadings, login: true });
            setError(null);
            let email = $('input[name="email"]').val();
            let password = $('input[name="password"]').val();

            try {
                console.log({ email: email, password: password });
                const user = await pb.collection('users').authWithPassword(email, password);
                console.log('user', user);
            } catch (error) {
                console.log(error)
                console.log(error?.data || 'Unknown error');
                setError('Failed to login. Please check your credentials and try again.');
            }
            setLoadings({ ...loadings, login: false });
        }

        let [loadings, setLoadings] = useState({});

        let [error, setError] = useState(null);

        return (
            <div className="flex flex-col w-full max-w-sm gap-4 mx-auto">

                <div className="bg-base-200 w-full max-w-[200px] flex items-center justify-center rounded-full aspect-square mx-auto shadow border">
                    <i class="text-8xl fi fi-rr-user"></i>
                </div>
                <div className="mx-auto text-3xl font-bold">Sign in</div>
                <div className="overflow-hidden errordiv"></div>

                <div className="relative w-full">
                    <ErrorDiv error={error} />
                </div>
                <div class="relative w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i class="fi fi-rr-envelope"></i></div>
                    <input type="text" name="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" required />
                </div>

                <div class="relative w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i class="fi fi-rr-key"></i>
                    </div>
                    <button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3 peer">
                        <label class="cursor-pointer">
                            <input type="checkbox" class="peer hidden" onChange={e => { document.querySelector('input[name="password"]').type = e.target.checked ? "text" : "password" }} />
                            <i className="fi fi-rr-eye peer-checked:hidden"></i>
                            <i className="hidden fi fi-rr-eye-crossed peer-checked:flex"></i>
                        </label>
                    </button>
                    <input type="password" name="password" class=" bg-gray-50 peer-has-[:checked]:bg-red-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Password" required />
                </div>


                <button disabled={loadings.login} class="disabled:opacity-50 disabled:pointer-events-none w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                    onClick={login} >
                    <span class="h-10 w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 grid place-items-center">
                        {loadings.login ? (
                            <div role="status" className="h-full">
                                <svg aria-hidden="true" class="h-full aspect-square text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            </div>
                        ) : 'Login'}
                    </span>
                </button>
                <div className="text-sm text-center">
                    Don't have an account? <a className="special-link" onClick={e => { e.preventDefault(); navigate('/auth/register'); }}>Register</a>
                </div>
            </div>
        );
    }
    function RegisterPage() {

        async function register(e) {
            e.preventDefault();
            setLoadings({ ...loadings, register: true });
            setError(null);
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
                setError(error?.data?.message || 'Unknown error');
            }
            setLoadings({ ...loadings, register: false });

        }

        let [loadings, setLoadings] = useState({});

        let [error, setError] = useState(null);

        return (
            <div className="flex flex-col w-full max-w-sm gap-4 mx-auto ">

                <div className="bg-base-200 w-full max-w-[200px] flex items-center justify-center rounded-full aspect-square mx-auto shadow border">
                    <i class="text-8xl fi fi-rr-user"></i>
                </div>
                <div className="mx-auto text-3xl font-bold">Register</div>
                <div className="relative w-full">
                    <ErrorDiv error={error} />
                </div>
                <div class="relative w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i class="fi fi-rr-envelope"></i></div>
                    <input type="text" name="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Username" required />
                </div>
                <div class="relative w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><i class="fi fi-rr-envelope"></i></div>
                    <input type="text" name="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Email" required />
                </div>
                <div class="relative w-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i class="fi fi-rr-key"></i>
                    </div>
                    <button type="button" class="absolute inset-y-0 end-0 flex items-center pe-3 peer">
                        <label class="cursor-pointer">
                            <input type="checkbox" class="peer hidden" onChange={e => { document.querySelector('input[name="password"]').type = e.target.checked ? "text" : "password" }} />
                            <i className="fi fi-rr-eye peer-checked:hidden"></i>
                            <i className="hidden fi fi-rr-eye-crossed peer-checked:flex"></i>
                        </label>
                    </button>
                    <input type="password" name="password" class=" bg-gray-50 peer-has-[:checked]:bg-red-500 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Password" required />
                </div>



                <button disabled={loadings.register} class="disabled:opacity-50 disabled:pointer-events-none w-full relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                    onClick={register} >
                    <span class="h-10 w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 grid place-items-center">
                        {loadings.register ? (
                            <div role="status" className="h-full">
                                <svg aria-hidden="true" class="h-full aspect-square text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                            </div>
                        ) : 'Register'}
                    </span>
                </button>

                <div className="text-sm text-center">
                    Already have an account? <a className="special-link" onClick={e => { e.preventDefault(); navigate('/auth/login'); }}>Login</a>
                </div>
            </div >
        );
    }
    function Content() {
        return (
            <div className="flex items-center justify-center w-full h-full px-4 border">

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
            <div className="flex flex-col w-screen h-screen border bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ">
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