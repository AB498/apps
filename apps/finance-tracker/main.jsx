const { useState, useEffect, createContext, useContext, useRef } = React;
const { HashRouter, Route, Switch, useHistory, useLocation } = ReactRouterDOM;


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

ReactDOM.createRoot(document.getElementById("root")).render(
    <Providers>
        <App />
    </Providers>
);

function Providers({ children }) {
    const state = reactive(JSON.parse(localStorage["state"] || "{}"));
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

function App() {
    useContext(StateContext);
    if (!state.hello) state.hello = 'world';
    return <div onClick={() => { state.hello += "1 " }}>{state.hello}</div>;
}