var app = require("app"); // Module to control application life.
var dialog = require("dialog");
var fs = require("fs-extra");
var ipc = require("ipc");
var os = require("os");
var path = require("path");

var BrowserWindow = require("browser-window");

var mainWindow = null;
var hasExecuted = false;

var unityHomeDir = path.join(__dirname, "../../WebPlayer");
// If running in non-packaged / development mode, this dir will be slightly different
if (process.env.npm_node_execpath) {
    unityHomeDir = path.join(app.getAppPath(), "/build/WebPlayer");
}

process.env["UNITY_HOME_DIR"] = unityHomeDir;
process.env["UNITY_DISABLE_PLUGIN_UPDATES"] = "yes";

app.commandLine.appendSwitch("enable-npapi");

var plugin = path.join(unityHomeDir, "/loader/npUnity3D32.dll");

app.commandLine.appendSwitch(
    "load-plugin",
    plugin
);

console.log("Plugin url: " + plugin);

app.commandLine.appendSwitch("no-proxy-server");

var userData = app.getPath("userData");
var configPath = path.join(userData, "config.json");
var serversPath = path.join(userData, "servers.json");
var versionsPath = path.join(userData, "versions.json");

function initialSetup(firstTime) {
    if (!firstTime) {
        // Back everything up, just in case
        fs.copySync(configPath, configPath + ".bak");
        fs.copySync(serversPath, serversPath + ".bak");
        fs.copySync(versionsPath, versionsPath + ".bak");
    } else {
        // First-time setup
        // Copy default servers
        fs.copySync(
            path.join(__dirname, "/defaults/servers.json"),
            serversPath
        );        
    }

    // Copy default versions and config
    fs.copySync(path.join(__dirname, "/defaults/versions.json"), versionsPath);
    fs.copySync(path.join(__dirname, "/defaults/config.json"), configPath);

    console.log("JSON files copied.");
    showMainWindow();
}

ipc.on("exit", function (id) {
    mainWindow.destroy();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    if (process.platform != "darwin") app.quit();
});

app.on("ready", function () {
    // Check just in case the user forgot to extract the zip.
    zipCheck = app.getPath("exe").includes(os.tmpdir());
    if (zipCheck) {
        var errorMessage =
            "It has been detected that MQClient is running from the TEMP folder.\n\n" +
            "Please extract the entire Client folder to a location of your choice before starting MQClient.";
        dialog.showErrorBox("Error!", errorMessage);
        return;
    }
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/build/icon.ico',
        show: false,
        "web-preferences": {
            plugins: true,
        },
    });

    mainWindow.setMinimumSize(800, 600);

    // Check for first run
    try {
        if (!fs.existsSync(configPath)) {
            console.log("Config file not found. Running initial setup.");
            initialSetup(true);
        } else {
            var config = fs.readJsonSync(configPath);
            if (!config["last-version-initialized"]) {
                console.log("Pre-1.0 config detected. Running migration.");
                initialSetup(false);
            } else {
                showMainWindow();
            }
        }
    } catch (ex) {
        dialog.showErrorBox(
            "Error!",
            "An error occurred while checking for the config. Make sure you have sufficent permissions."
        );
        app.quit();
    }

    // Makes it so external links are opened in the system browser, not Electron
    mainWindow.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        require("shell").openExternal(url);
    });

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
});

function showMainWindow() {
    // Load the index.html of the app.
    mainWindow.loadUrl("file://" + __dirname + "/index.html");

    // Reduces white flash when opening the program
    mainWindow.webContents.on("did-finish-load", function () {
        if (!hasExecuted)
        {
            mainWindow.webContents.executeJavaScript("setAppVersionText();");
            // everything's loaded, tell the renderer process to do its thing
            mainWindow.webContents.executeJavaScript("loadConfig();");
            mainWindow.webContents.executeJavaScript("loadGameVersions();");
            mainWindow.webContents.executeJavaScript("loadServerList();");

            hasExecuted = true;
        }
        mainWindow.show();
    });

    mainWindow.webContents.on("plugin-crashed", function () {
        var errorMessage =
            "Unity Web Player has crashed - please re-open the application.\n" +
            "If this error persists, please read the FAQ or ask for support in our Discord server.";
        dialog.showErrorBox("Error!", errorMessage);
        mainWindow.destroy();
        app.quit();
    });
}
