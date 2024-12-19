(async () => {
    function uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    function log(...args) { console.log(...args); return args[0]; }
    const { useState, useEffect, createContext, useContext, useRef } = React;
    const { HashRouter, Route, Switch, useHistory, useLocation } = ReactRouterDOM;
    const useBeforeMount = (func) => {
        const hasMounted = React.useRef(false);
        if (!hasMounted.current) {
            func();
            hasMounted.current = true;
        }
    };
    const pb = new PocketBase('http://world.ovh/pb'); // ,store
    window.pb = pb;

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
        let setter = () => setState(state);
        state = makeReactive(state, setter);
        return state;
    };


    const StateContext = createContext(); // global state


    function Providers({ children }) {
        const state = reactive(JSON.parse(localStorage.getItem("state") || "{}"));
        useEffect(() => { localStorage["state"] = JSON.stringify(state) }, [state]);
        window.state = state;
        return (
            <HashRouter>
                <StateContext.Provider value={[state]}>
                    {children}
                </StateContext.Provider>
            </HashRouter>
        );
    }

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


    function App() {

        let breakpoint = useBreakpoint();

        window.breakpoint = breakpoint;

        async function adminLogin() {
            try {
                log(await pb.admins.authWithPassword("abcd49800@gmail.com", "Uihjbnygv1$"));
            } catch (e) {
                console.log(e);
            }
        }
        pb.authStore.onChange(() => {
            state.user = pb.authStore.model;

            if (!state.user) navigate("/auth");
            else navigate("/");
        });
        let history = useHistory();
        let location = useLocation();
        window.navigate = (path) => history.push(path);
        useContext(StateContext);
        useEffect(() => {
            if (!state.user) navigate("/auth");
        }, [location, state.user])
        return (
            <div className="flex flex-col h-screen text-black bg-white dark:bg-black dark:text-white">
                <div className="flex items-center w-full h-10 gap-2 p-2 border">
                    <div>{uuid().slice(0, 3)}</div>
                    <div className="grow"></div>
                    {state.user ? (
                        <div className="flex gap-2">
                            <div>{state.user.email}</div>
                            <div className="hover:underline hover:cursor-pointer hover:text-blue-500" onClick={() => pb.authStore.clear()}>Logout</div>
                        </div>
                    ) : (
                        <div className="hover:underline hover:cursor-pointer hover:text-blue-500" onClick={adminLogin}>Admin Login</div>
                    )}
                </div>
                {state.user ? <AllPages /> : <AuthPage />}
            </div>
        );
    }

    function AllPages() {
        return (
            <Switch>
                <Route path="/auth">
                    <AuthPage />
                </Route>
                <Route path="/">
                    <Dashboard />
                </Route>
            </Switch>
        );
    }

    function AuthPage() {
        return (
            <div className="flex flex-col border grow">
                <div className="text-6xl full center">AuthPage</div>
            </div>
        );
    }

    function Dashboard() {
        if (!state.sidebar) state.sidebar = { open: false };
        return (
            <div className="flex flex-col overflow-auto full">
                <div className="sticky top-0 z-10">
                    <TopNav />
                </div>
                {breakpoint.sm &&
                    <div class="flex flex-col grow justify-between border bg-white dark:bg-neutral-900 w-full max-w-[25vw] overflow-auto">
                        <SideNav />
                    </div> || <div className={`z-10 fixed top-0 left-0 w-full h-full bg-white dark:bg-neutral-900 duration-300 ${state.sidebar.open ? "tranlate-x-0" : "-translate-x-full"}`}>
                        <div className="p-2">
                            <div className="btn btn-square bg-neutral-100 dark:bg-neutral-800" onClick={() => state.sidebar.open = !state.sidebar.open}>
                                <i className="fi fi-rr-angle-left"></i>
                            </div>
                        </div>
                        <SideNav />

                    </div>}

            </div>
        );
    }
    function TopNav() {
        return (

            <div className="border">
                <ul class="menu menu-horizontal bg-neutral-200 dark:bg-neutral-800 w-full flex items-center gap-2">
                    {!breakpoint.sm && <li>
                        <div className="btn btn-square bg-neutral-100 dark:bg-neutral-800" onClick={() => state.sidebar.open = !state.sidebar.open}>
                            <i className="fi fi-rr-menu-burger"></i>
                        </div>
                    </li>}
                    <div className="grow"></div>
                    <li><a>Item 2</a></li>
                    <li><a>Item 3</a></li>
                </ul>
            </div>
        )
    }
    function SideNav() {
        return (
            <div class="flex flex-col full">
                <ul class="menu w-full">
                    <li><div className="flex items-center gap-2" onClick={() => (state.sidebar.open = false) | navigate("/")}>
                        <i className="fi fi-rr-home"></i>
                        <div>Dashboard</div>
                    </div></li>
                    <li>
                        <details open>
                            <summary><div className="flex items-center gap-2">
                                <i className="fi fi-rr-wallet"></i>
                                <div>Finance</div>
                            </div></summary>
                            <ul>
                                <li><a onClick={() => (state.sidebar.open = false) | navigate("/finance")}>Status</a></li>
                                <li><a onClick={() => (state.sidebar.open = false) | navigate("/finance/account")}>Account</a></li>
                            </ul>
                        </details>
                    </li>
                    <li><div className="flex items-center gap-2" onClick={() => (state.sidebar.open = false) | navigate("/schedules")}>
                        <i className="fi fi-rr-calendar"></i>
                        <div>Schedules</div>
                    </div></li>
                </ul>
                <div className="grow"></div>
                <div class="sticky inset-x-0 bottom-0 border-t border-gray-100">
                    <a href="#" class="flex items-center gap-2 p-4 bg-white  hover:bg-gray-50 dark:bg-neutral-800 hover:dark:bg-neutral-700">
                        <img src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                            class="size-10 rounded-full object-cover" />
                        <div>
                            <p class="text-xs">
                                <strong class="block font-medium">{state.user.name || "NoName"}</strong>
                                <span> {state.user.email} </span>
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        )
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
        <Providers>
            <App />
        </Providers>
    );
})();