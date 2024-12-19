let alertify = window.alertify || { success: (msg) => { } };
window.alertify = alertify;
window.time = new Date();
const inRange = (num, min, max) => num >= min && num <= max;

async function downImage(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // rename the blob file
    const renamedBlob = new File([blob], "newFileName.jpg");
    return renamedBlob;
  } catch (e) {
    console.log("Failed image download", url);
  }
}

const consoleWarn = console.error;
const SUPPRESSED_WARNINGS = [
  "Warning: React has detected a change in the order of Hooks",
  "Warning: ReactDOM.render is no longer supported",
  "Warning: `value` prop on `input` should not be null",
  "cdn.tailwindcss.com should not be used in production",
  "Download the React DevTools",
  "You are using the in-browser Babel",
  "Warning: A component is changing an uncontrolled",
  "Warning: Invalid DOM property",
  'Each child in a list should have a unique "key" prop',
];

// ["error"].forEach(
//   (method) =>
//   (console[method] = function filterWarnings(msg, ...args) {
//     try {
//       if (!SUPPRESSED_WARNINGS.some((entry) => msg.includes(entry))) {
//         consoleWarn(msg, ...args);
//       }
//     } catch (e) { }
//   })
// );
function styleToObject(style) {
  if (!style) return null;
  let obj = {};
  style.split(";").forEach((s) => {
    let keyval = s.split(":");
    let [key, value] = [keyval[0], keyval.slice(1).join(":")];
    key = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[key.trim()] = value.trim();
  });
  return obj;
}
function isClass(v) {
  if (typeof v !== "function") {
    return false;
  }
  try {
    v();
    return false;
  } catch (error) {
    if (/^Class constructor/.test(error.message)) {
      return true;
    }
    return false;
  }
}
function funcType(x) {
  return typeof x === "function" ? (x.prototype ? (Object.getOwnPropertyDescriptor(x, "prototype").writable ? "function" : "class") : x.constructor.name === "AsyncFunction" ? "async" : "arrow") : "";
}
function isFunction(x) {
  return typeof x === "function" ? (x.prototype ? (Object.getOwnPropertyDescriptor(x, "prototype").writable ? true : false) : true) : false;
  // return typeof x === "function" && x.prototype && Object.getOwnPropertyDescriptor(x, "prototype").writable ? true : false;
}
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

function cons(...args) {
  console.log(...args);
  return args[0];
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isJSONObject(obj) {
  if ([Date, RegExp, Error].some((t) => obj instanceof t) || Array.isArray(obj)) {
    return false;
  }
  try {
    safeStringify(obj);
    return obj && typeof obj == "object";
  } catch (e) {
    return false;
  }
}

let safeStringify = function (...args) {
  let replacer = ((obj) => {
    let cache = [];
    return (key, value) => {
      if (isFunction(value)) {
        return "" + value;
      }
      return typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value;
    };
  })();
  return JSON.stringify(args[0], replacer, ...args.slice(2));
};
let safeParse = function (...args) {
  try {
    // Define a reviver function to handle parsing functions
    const reviver = (key, value) => {
      if (typeof value === "string" && value.startsWith("function")) {
        // If the value is a string starting with 'function', parse it back to a function
        const functionStr = `(${value})`;
        return eval(functionStr); // Using eval to convert string to function
      }
      return value;
    };

    return JSON.parse(args[0], reviver);
  } catch (e) {
    console.error(e);
    return null;
  }
};

String.prototype.toTitleCase = function () {
  let str = this.toLowerCase();
  str = str.split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};


function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addLoggerWindow() {

  window.debugcount = 0;
  var logs = [];
  window.utilsHasRun = window.utilsHasRun || false;
  window.onload = () => {
    utilsHasRun = true;
    document.body.insertAdjacentHTML(
      "afterbegin",
      `
  <pre class="" id="s-snackbar">Some text some message..</pre>
  
  <style>
  #s-snackbar {
    whitespace: pre;
    max-width:80vw;
    max-height:50vh;
    overflow: auto;
    opacity: 0;
    pointer-events: none;
    border: 3px solid #555;
    min-width: 150px;
    background-color: #333;
    color: #fff;
    border-radius: 2px;
    padding: 10px;
    position: fixed;
    z-index: 99999;
    left: 50%;
    top: 30px;
    transform: translateX(-50%) translateY(20%);
    border-radius: 5px;
    transition: all 0.3s;
    box-shadow: 7px 7px 15px -10px white;
  } 
  #s-snackbar.show {
    pointer-events: all;
    transform: translateX(-50%) translateY(0%);
    animation: flash 0.3s linear 1;
    opacity: 1;
  }

  @keyframes flash {
    0%{
      background-color: #333;
    }
    50%{
      background-color: #999;
    }
    100%{
      background-color: #333;
    }
  }
  </style>
  
    `
    );

    window.showToast = (msg, bgCol, timeout) => {
      var x = document.querySelector("#s-snackbar");
      x.classList.add("show");
      x.textContent = msg;
      if (bgCol) x.style.backgroundColor = bgCol;
      else x.style.backgroundColor = "";
      if (window.toastinterval) clearTimeout(window.toastinterval);
      window.toastinterval = setTimeout(function () {
        x.classList.remove("show");
      }, timeout || 2000);
    }

    if (logs?.length) {
      logs.forEach((el) => deb_log(...el.args));
      logs = [];
    }

    document.body.insertAdjacentElement(
      "beforeend",
      new DOMParser().parseFromString(
        `
      <div style="display: none;"
        class="debugcol max-h-96 block hover:opacity-75 z-[99999] text-xs items-stretch transition-all duration-300 h-8 w-full max-w-[50vw] rounded-md dark:text-zinc-50 text-zinc-950/75 bg-zinc-50 dark:bg-zinc-950/75 flex flex-col overflow-auto whitespace-pre-wrap transition-all bottom-0 fixed z-50 backdrop-filter backdrop-blur-sm">
        <div class="flex gap-1 h-8 w-full shrink-0 justify-center font-bold bg-zinc-100 dark:bg-zinc-950/75 p-1 sticky top-0 z-10 border-b shadow">
            <div class="debugtitle grow rounded hover:bg-gray-500  bg-zinc-200 dark:bg-zinc-900/75 flex justify-center items-center "
             onclick="
             if (document.querySelector('.debugcol').classList.contains('h-1/4')) {
               document.querySelector('.debugcol').classList.remove('h-1/4');
               document.querySelector('.debugcol').classList.add('h-8');
             }else{
               document.querySelector('.debugcol').classList.remove('h-8');
               document.querySelector('.debugcol').classList.add('h-1/4');
             }
             "
            > LOGS </div>
            <div class="flex justify-center items-center rounded hover:bg-gray-500  bg-zinc-200 dark:bg-zinc-900/75 aspect-square h-full"
            onclick="document.querySelector('#debug-settings').classList.toggle('hidden');"
            > &#9776;</div>
        </div>
        <div id="debug-settings" class="flex flex-col hidden p-2 bg-zinc-50 dark:bg-zinc-950/75">
          <label class="flex gap-2 p-2">
            <input type="checkbox" id="debug-auto-open" onchange="window.localStorage.setItem('debug-auto-open', this.checked)" />
            <div class="">Auto Open</div>
          </label>
        </div>
        <div class="debug flex flex-col overflow-auto grow h-full">
            <div class="grow"></div>
        </div>
    </div>`,
        "text/html"
      ).body.firstChild
    );
    poll(() => window.tailwind).then(() => {
      document.querySelector(".debugcol").style.display = "";
    })
    document.querySelector("#debug-auto-open").checked = window.localStorage.getItem("debug-auto-open") == "true";

  };
  if (!window.localStorage.getItem("debug-auto-open")) window.localStorage.setItem("debug-auto-open", "false");
  if (document.readyState === 'complete' && !utilsHasRun) {
    window.onload();
  }
  function escapeHTML(str) {
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  window.debug = (...args) => {
    originalLog(...args);
    if (!document.querySelector(".debug")) {
      logs.push({ args, consumed: false });
      return;
    }
    if (logs.length) {
      logs.forEach((el) => deb_log(...el.args));
      logs = [];
    }
    deb_log(...args);
  };

  window.deb_log = (...args) => {
    if (!document.querySelector(".debug")) return;
    const hours = new Date().getHours();
    if (!args[0]) {
      window.deb_log(args.map(escapeHTML).join(" "));
      return;
    }
    if (args[0] instanceof HTMLElement) {
      window.deb_log(args.map(escapeHTML).join(" "));
      return;
    }
    if (isFunction(args[0])) {
      window.deb_log("" + args[0]);
      return;
    }
    let ss = new Error().stack
      .toString()
      .split(/\r\n|\n/)
      .slice(1);
    let s = ss.shift();
    while (s && s.includes("utils.js")) {
      s = ss.shift();
    }
    const src = s
      ? `${s
        .substr(s.lastIndexOf("/") + 1)
        .replace(/\:\d+$/, "")
        .replace(/.*at/, "")
        .trim()}`
      : "<< unknown >>";

    // create timestamp for log
    let time = (hours % 12 || 12).toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0") + ":" + new Date().getSeconds().toString().padStart(2, "0") + "." + new Date().getMilliseconds().toString().padStart(3, "0") + " " + (hours >= 12 ? "PM" : "AM");
    // const time = new Date().toLocaleString("en-US", { hour12: false });

    if (args.length == 1 && (isJSONObject(args[0]) || Array.isArray(args[0]))) {
      let jsv = new DOMParser()
        .parseFromString(
          `<div class="border-b border-green-600/50 px-1 flex flex-col bg-zinc-50 dark:bg-zinc-950/75 font-mono whitespace-pre-wrap"><div class="time line-clamp-1 text-xs text-right self-end border-gray-400 px-1 border-b border-l">${src} | ${time}</div></div>`,
          "text/html"
        )
        .documentElement.querySelector("body").firstChild;
      let jsv2 = new DOMParser().parseFromString(`<div class="w-full h-full"></div>`, "text/html").documentElement.querySelector("body").firstChild;
      document.querySelector(".debug").insertAdjacentElement("afterbegin", jsv);
      jsv.appendChild(jsv2);
      new JsonViewer({
        container: jsv2,
        data: safeStringify(args[0]),
        theme: jsonViewerTheme,
        expand: false,
      });
    } else {
      function fmt(o) {
        return escapeHTML(typeof o == 'object' ? safeStringify(o, null, 2) : o);
      }
      let argsString = args
        .map((e) => e.message ? e.message : fmt(e))
        .join(" ")
        .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
      let jsv = new DOMParser()
        .parseFromString(
          `<div class="border-b border-green-600/50 px-1 flex flex-col bg-zinc-50 dark:bg-zinc-950/75 font-mono whitespace-pre-wrap"><div class="time line-clamp-1 text-xs text-right self-end border-gray-400 px-1 border-b border-l">${src} | ${time}</div><div>${argsString}</div></div>`,
          "text/html"
        )
        .documentElement.querySelector("body").firstChild;
      document.querySelector(".debug").insertAdjacentElement("afterbegin", jsv);
      alertify.success(argsString);
    }
    debugcount++;
    document.querySelector(".debugtitle").textContent = `LOGS (${debugcount})`;
    if (window.localStorage.getItem("debug-auto-open") == "true") {
      document.querySelector(".debugcol").classList.remove("h-8");
      document.querySelector(".debugcol").classList.add("h-1/4");
    }
  };
  // window.onerror = (event, source, lineno, colno, error) => {
  //   let msg = `${event}
  // ${source.replace(window.location.origin, "")}:${lineno}:${colno}`;
  //   window.debug(msg);
  //   return false; // true if you want to consume event
  // };

  window.originalLog = window.originalLog || window.console.log.bind(window.console);

  window.console.log = (...args) => {
    debug(...args);
  };
}


if (localStorage["debug1"]) addLoggerWindow();

function getRect(el, parent) {
  let boundingRect = el.getBoundingClientRect();
  let parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
  let paranetScrolls = parent ? { left: parent.scrollLeft, top: parent.scrollTop } : { left: 0, top: 0 };
  return {
    left: boundingRect.left - parentRect.left + paranetScrolls.left,
    top: boundingRect.top - parentRect.top + paranetScrolls.top,
    width: boundingRect.width,
    height: boundingRect.height,
  };
}


let overlayEls = [];
function overlayAppError(el, e) {
  el.style.position = "relative";
  let overlayEl = document.createElement("div");
  overlayEls.push(overlayEl);
  overlayEl.addAttribute("data-debug-overlay", uuidv4());
  overlayEl.style.position = "absolute";
  overlayEl.style.border = "6px solid red";
  overlayEl.style.top = "0px";
  overlayEl.style.left = "0px";
  overlayEl.style.width = "100%";
  overlayEl.style.height = "100%";
  overlayEl.textContent = e?.message;
  overlayEl.style.fontSize = "20px";
  overlayEl.style.color = "white";
  overlayEl.style.backgroundColor = "#222222aa";
  overlayEl.style.display = "flex";
  overlayEl.style.justifyContent = "center";
  overlayEl.style.alignItems = "center";
  overlayEl.style.backdropFilter = "blur(2px)";
  el.insertAdjacentElement("afterbegin", overlayEl);

  let closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "0px";
  closeBtn.style.right = "0px";
  closeBtn.style.fontSize = "14px";
  overlayEl.appendChild(closeBtn);

  closeBtn.addEventListener("click", () => {
    overlayEl.parentNode.removeChild(overlayEl);
  });

  let titleEl = document.createElement("div");
  titleEl.textContent = "Error in app: " + app.appname + "";
  titleEl.style.position = "absolute";
  titleEl.style.top = "0px";
  titleEl.style.left = "0px";
  titleEl.style.fontSize = "14px";
  overlayEl.appendChild(titleEl);
}

function releaseOverlayAppError(el) {
  let overlayEl = el.querySelector("[data-debug-overlay]");
  if (overlayEl) {
    overlayEl.parentNode.removeChild(overlayEl);
  }
  overlayEls = overlayEls.filter((e) => e != overlayEl);
}

function randColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
window.ondebug = [];
window.debugEl = (el, s) => {
  if (!el || !el.style) return;
  let tempEl = {
    border: el.style.border,
    backgroundColor: el.style.backgroundColor,
    textContent: el.textContent,
    boxShadow: el.style.boxShadow,
  };
  el.style.border = "4px dotted black";
  el.style.backgroundColor = "rgba(0, 255, 0, 0.1)";
  el.style.boxShadow = "0 0 7px 7px white";

  // el.textContent = s + '\n' + el.textContent;
  el.setAttribute("data-debug", uuidv4());
  // overlayAppError(el, s);
  ondebug.push({ tmp: tempEl, el: el, id: el.attributes["data-debug"] });
};
window.releaseEl = (el) => {
  if (!el || !el.style) return;

  let tmp = ondebug.find((e) => e.id == el.attributes["data-debug"]);
  if (tmp) {
    el.style.border = tmp.tmp.border;
    el.style.backgroundColor = tmp.tmp.backgroundColor;
    el.style.boxShadow = tmp.tmp.boxShadow;
    // el.textContent = tmp.tmp.textContent;
    el.removeAttribute("data-debug");
    ondebug = ondebug.filter((e) => e.id != el.attributes["data-debug"]);
  }
};

window.circularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) { }

  return false;
}

function findMatches(str) {
  let matches = [];
  let regex = /{{\s*(.*?)\s*}}/g;
  let match;
  while ((match = regex.exec(str))) {
    matches.push(match[1]);
  }
  return matches;
}
function findImmediateTextNodes(el) {
  let textNodes = [];
  for (let node of el.childNodes) {
    if (node.nodeType === 3) {
      textNodes.push(node);
    }
  }
  return textNodes;
}

const toString = Object.prototype.toString;
function isString(val) {
  return typeof val === "string";
}
function isNumber(val) {
  return typeof val === "number";
}
function isBoolean(val) {
  return typeof val === "boolean";
}
function isUndefined(val) {
  return typeof val === "undefined";
}
function isArray(val) {
  return toString.call(val) === "[object Array]";
}
function isObject(val) {
  return toString.call(val) === "[object Object]";
}
function isNull(val) {
  return toString.call(val) === "[object Null]";
}

let jsonViewerTheme = "light";
function JsonViewer(options) {
  const defaults = {
    theme: "light",
    container: null,
    data: "{}",
    expand: false,
  };
  this.options = Object.assign(defaults, options);
  if (isNull(options.container)) {
    throw new Error("Container: dom element is required");
  }
  this.render();
  return this;
}
JsonViewer.prototype.renderRight = function (theme, right, val) {
  right.setAttribute("class", "inline-block");
  if (isNumber(val)) {
    right.classList.add("text-blue-500");
  } else if (isBoolean(val)) {
    right.classList.add("text-red-500");
  } else if (val === "null") {
    right.classList.add("text-gray-500");
  } else {
    right.classList.add("text-black");
    right.classList.add("dark:text-white");
  }
  right.innerText = "" + val;
};
JsonViewer.prototype.renderChildren = function (theme, key, val, right, indent, left) {
  let self = this;
  let folder = this.createElement("span");
  let rotate90 = this.options.expand ? "rotate-90" : "";
  let addHeight = this.options.expand ? "h-auto" : "";
  folder.innerHTML = "&#9654"; // "▶"
  folder.setAttribute("class", "w-6 inline-block text-center " + rotate90);
  folder.onclick = function (e) {
    let nextSibling = e.target.parentNode.nextSibling;
    self.toggleItem(nextSibling, e.target);
  };
  let len = 0;
  let isObj = false;
  if (isObject(val)) {
    len = Object.keys(val).length;
    isObj = true;
  } else {
    len = val?.length;
  }
  left.innerHTML = isObj ? key + "&nbsp;&nbsp{" + len + "}" : key + "&nbsp;&nbsp[" + len + "]";
  left.prepend(folder);
  right.setAttribute("class", "h-0 overflow-hidden " + addHeight);

  self.parse(val, right, indent + 0, theme);
};

JsonViewer.prototype.parse = function (dataObj, parent, indent, theme) {
  const self = this;
  this.forEach(dataObj, function (val, key) {
    const { left, right } = self.createItem(indent, theme, parent, key, typeof val !== "object");
    if (typeof val !== "object") {
      self.renderRight(theme, right, val);
    } else {
      self.renderChildren(theme, key, val, right, indent, left);
    }
  });
};

JsonViewer.prototype.createItem = function (indent, theme, parent, key, basicType) {
  let self = this;
  let current = this.createElement("div");
  let left = this.createElement("div");
  let right = this.createElement("div");
  let wrap = this.createElement("div");

  current.setAttribute("class", "relative pl-6 overflow-hidden");
  left.innerHTML = `${key}<span class="">&nbsp;:&nbsp;</span>`;
  if (basicType) {
    current.appendChild(wrap);
    wrap.appendChild(left);
    wrap.appendChild(right);
    parent.appendChild(current);
    wrap.setAttribute("class", "jv-wrap");
    left.setAttribute("class", "inline-block cursor-pointer text-gray-500");
  } else {
    current.appendChild(left);
    current.appendChild(right);
    parent.appendChild(current);
    left.setAttribute("class", "flex cursor-pointer text-gray-500 jv-folder " + (this.options.expand ? "h-auto" : ""));
    left.onclick = function (e) {
      let nextSibling = e.target.nextSibling;
      self.toggleItem(nextSibling, e.target.querySelector("span"));
    };
  }

  return {
    left,
    right,
    current,
  };
};

JsonViewer.prototype.dispose = function () {
  this.options.container.innerHTML = "";
};
JsonViewer.prototype.render = function () {
  this.dispose();
  let data = this.options.data;
  let theme = "jv-" + this.options.theme + "-";
  let indent = 0;
  let parent = this.options.container;
  let key = "object";
  let dataObj;

  parent.setAttribute("class", "text-gray-900 dark:text-gray-400");
  try {
    dataObj = JSON.parse(data);
  } catch (error) {
    throw new Error("It is not a json format");
  }
  if (isArray(dataObj)) {
    key = "array";
  }
  const { left, right } = this.createItem(indent, theme, parent, key);
  this.renderChildren(theme, key, dataObj, right, indent, left);
};

JsonViewer.prototype.toggleItem = function (ele, target) {
  ele?.classList?.toggle("h-auto");
  target?.classList?.toggle("rotate-90");
};

JsonViewer.prototype.createElement = function (type) {
  return document.createElement(type);
};

JsonViewer.prototype.forEach = function (obj, fn) {
  if (isUndefined(obj) || isNull(obj)) {
    return;
  }
  if (typeof obj === "object" && isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn.call(null, obj[key] ?? "null", key, obj);
      }
    }
  }
};

window.JsonViewer = JsonViewer;
