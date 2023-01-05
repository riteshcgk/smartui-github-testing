const host = getParameterByName("host", window.location.href);
const port = getParameterByName("port", window.location.href) || false;
const xp = getParameterByName("xp", window.location.href) || false;
const readonly = getParameterByName("readonly", window.location.href) || false;

const width = readonly ? 1440 : window.innerWidth;
const height = readonly ? 900 : window.innerHeight;

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let url =
    "hostname=" +
    host +
    "&width=" +
    width +
    "&height=" +
    height +
    "&security=any&dpi=" +
    $("#dpi").height();

if (port) {
    url = url + "&scheme=vnc&port=5901";
} else {
    url = url + "&scheme=rdp&port=3389";
}

if (xp) {
    url = url + "&console=true";
}

function getTunnelUrl() {
    return "wss://stage-ml-remotes.lambdatestinternal.com/guacamole/websocket-tunnel";
}

function registerActions(guac, display) {
    if (!readonly) {
        const mouse = new Guacamole.Mouse(guac.getDisplay().getElement());
        mouse.onmousedown =
            mouse.onmouseup =
            mouse.onmousemove =
                function (mouseState) {
                    guac.sendMouseState(mouseState);
                }.bind(this);

        const keyboard = new Guacamole.Keyboard(document.getElementById("inputText"));
        keyboard.onkeydown = function (keysym) {
            if (!(keyboard.modifiers.alt === true && keysym === 65289))
                guac.sendKeyEvent(1, keysym);
        };
        keyboard.onkeyup = function (keysym) {
            if (!(keyboard.modifiers.alt === true && keysym === 65289))
                guac.sendKeyEvent(0, keysym);
        };
    }
}

function setScaling(guac) {
    setTimeout(function () {
        const h = $("#display").find("canvas").height();
        console.log(window.innerHeight / h);
        guac.getDisplay().scale(window.innerHeight / h);
        guac.setMouseScale(window.innerHeight / h);
        guac.getDisplay()
            .getCursorLayer()
            .scale(window.innerHeight / h);

        var display = document.getElementById("display");
        var divs = display.getElementsByTagName("div");
        var div1 = divs[0];
        div1.style.textAlign = "-webkit-auto";
    }, 100);
}

function getTunnel() {
    const tunnel_url = this.getTunnelUrl();
    const tunnel = new Guacamole.WebSocketTunnel(tunnel_url);
    tunnel.onerror = function (error) {
        console.log(error.message || error.toString());
        startGuacamoleSession();
    };
    return tunnel;
}

function hideLoader() {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) {
        loadingEl.classList.add("hidden");
    }
}

function startGuacamoleSession() {
    const startTime = Date.now();

    // Display error incase it takes more than 5 mins to set up the machine.
    const timeout = setTimeout(() => {
        const timeoutEl = document.getElementById("guac-connection-timeout");
        timeoutEl.classList.remove("hidden");
        hideLoader();
    }, DEFAULT_TIMEOUT_MS);

    $("#display").empty();
    const display = document.getElementById("display");
    const tunnel = getTunnel();
    const guac = new Guacamole.Client(tunnel);
    display.appendChild(guac.getDisplay().getElement());
    setTimeout(function () {
        //         guac.getDisplay().showCursor(false);
        guac.connect(url);
        registerActions(guac, display);
    }, 1000);

    guac.onstatechange = function (state) {
        if (state === 3) {
            if (Date.now() - startTime > DEFAULT_TIMEOUT_MS) {
                // Don't do anything if it took more than 5mins to setup.
                return;
            }
            clearTimeout(timeout);
            hideLoader();
            const displayEl = document.getElementById("display");
            displayEl.classList.remove("hidden");
            setScaling(guac);
        }
    };

    guac.onerror = function (error) {
        console.log(error.message || error.toString());
    };

    const button = document.getElementById("send-text");
    button.addEventListener("click", function () {
        sendText(guac);
    });
}

function sendText(guac) {
    guac.setClipboard($("#text").val());
    $("#text").val("");
}

document.getElementById("display").addEventListener("click", function () {
    document.getElementById("inputText").focus();
});

startGuacamoleSession();
