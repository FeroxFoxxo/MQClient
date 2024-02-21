var remote = require("remote");
var remotefs = remote.require("fs-extra");
var path = remote.require("path");

var userData = remote.require("app").getPath("userData");
var configPath = path.join(userData, "config.json");
var serversPath = path.join(userData, "servers.json");
var versionsPath = path.join(userData, "versions.json");

var versionArray;
var serverArray;

function enableServerListButtons() {
    $("#of-connect-button").removeClass("disabled");
    $("#of-connect-button").prop("disabled", false);
    $("#of-editserver-button").removeClass("disabled");
    $("#of-editserver-button").prop("disabled", false);
    $("#of-deleteserver-button").removeClass("disabled");
    $("#of-deleteserver-button").prop("disabled", false);
}

function disableServerListButtons() {
    $("#of-connect-button").addClass("disabled");
    $("#of-connect-button").prop("disabled", true);
    $("#of-editserver-button").addClass("disabled");
    $("#of-editserver-button").prop("disabled", true);
    $("#of-deleteserver-button").addClass("disabled");
    $("#of-deleteserver-button").prop("disabled", true);
}

function getAppVersion() {
    appVersion = remote.require("app").getVersion();

    // Simplify version, ex. 1.4.0 -> 1.4,
    // but only if a revision number isn't present
    if (appVersion.endsWith(".0")) {
        return appVersion.substr(0, appVersion.length - 2);
    } else {
        return appVersion;
    }
}

function setAppVersionText() {
    $("#of-aboutversionnumber").text("Version " + getAppVersion());
    $("#of-versionnumber").text("v" + getAppVersion());
}

function addServer() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));

    var server = {};
    server["uuid"] = uuidv4();
    server["description"] =
        $("#addserver-descinput").val().length == 0
            ? "My MQ Server"
            : $("#addserver-descinput").val();
    server["ip"] =
        $("#addserver-ipinput").val().length == 0
            ? "http://localhost/"
            : $("#addserver-ipinput").val();
    server["version"] = $("#addserver-versionselect option:selected").text();
    server["username"] = "";
    server["password"] = "";

    jsonToModify["servers"].push(server);

    remotefs.writeFileSync(serversPath, JSON.stringify(jsonToModify, null, 4));
    loadServerList();
}

function editServer() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));
    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            value["description"] =
                $("#editserver-descinput").val().length == 0
                    ? value["description"]
                    : $("#editserver-descinput").val();
            value["ip"] =
                $("#editserver-ipinput").val().length == 0
                    ? value["ip"]
                    : $("#editserver-ipinput").val();
            value["version"] = $(
                "#editserver-versionselect option:selected"
            ).text();
        }
    });

    remotefs.writeFileSync(serversPath, JSON.stringify(jsonToModify, null, 4));
    loadServerList();
}

function deleteServer() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));
    var result = jsonToModify["servers"].filter(function (obj) {
        return obj.uuid === getSelectedServer();
    })[0];

    var resultindex = jsonToModify["servers"].indexOf(result);

    jsonToModify["servers"].splice(resultindex, 1);

    remotefs.writeFileSync(serversPath, JSON.stringify(jsonToModify, null, 4));
    loadServerList();
}

function restoreDefaultServers() {
    remotefs.copySync(
        path.join(__dirname, "/defaults/servers.json"),
        serversPath
    );
    loadServerList();
}

function loadGameVersions() {
    var versionJson = remotefs.readJsonSync(versionsPath);
    versionArray = versionJson["versions"];
    $.each(versionArray, function (key, value) {
        $(new Option(value.name, "val")).appendTo("#addserver-versionselect");
        $(new Option(value.name, "val")).appendTo("#editserver-versionselect");
    });
}

function loadConfig() {
    // Load config object globally
    config = remotefs.readJsonSync(configPath);
}

function loadServerList() {
    var serverJson = remotefs.readJsonSync(serversPath);
    serverArray = serverJson["servers"];

    $(".server-listing-entry").remove(); // Clear out old stuff, if any
    disableServerListButtons(); // Disable buttons until another server is selected

    if (serverArray.length > 0) {
        // Servers were found in the JSON
        $("#server-listing-placeholder").attr("hidden", true);
        $.each(serverArray, function (key, value) {
            // Create the row, and populate the cells
            var row = document.createElement("tr");
            row.className = "server-listing-entry";
            row.setAttribute("id", value.uuid);
            var cellName = document.createElement("td");
            cellName.textContent = value.description;
            var cellVersion = document.createElement("td");
            cellVersion.textContent = value.version;
            cellVersion.className = "text-monospace";

            row.appendChild(cellName);
            row.appendChild(cellVersion);
            $("#server-tablebody").append(row);
        });
    } else {
        // No servers are added, make sure placeholder is visible
        $("#server-listing-placeholder").attr("hidden", false);
    }
}

// For writing loginInfo.php, assetInfo.php, etc.
function setGameInfo(serverUUID) {
    var result = serverArray.filter(function (obj) {
        return obj.uuid === serverUUID;
    })[0];
    var gameVersion = versionArray.filter(function (obj) {
        return obj.name === result.version;
    })[0];
    
    // game-client.js needs to access this
    window.ipAddress = result.ip; 
    window.version = gameVersion.url;

    console.log("User data path: " + userData);

    //launchGame();
}

// Returns the UUID of the server with the selected background color.
// Yes, there are probably better ways to go about this, but it works well enough.
function getSelectedServer() {
    return $("#server-tablebody > tr.bg-primary").prop("id");
}

function launchConnection() {
    // Get ID of the selected server, which corresponds to its UUID in the json
    console.log("Connecting to server with UUID of " + getSelectedServer());

    // Prevent the user from clicking anywhere else during the transition
    $("body,html").css("pointer-events", "none");
    stopEasterEggs();
    $("#of-serverselector").fadeOut("slow", function () {
        setTimeout(function () {
            $("body,html").css("pointer-events", "");
            launchGame();
        }, 200);
    });
}

function login() {
    // Get ID of the selected server, which corresponds to its UUID in the json
    console.log("Logging in...");

    var ajaxUrl = window.ipAddress + "/api/getHost";
    console.log("Sending request to " + ajaxUrl);

    $.ajax({
        url: ajaxUrl,
        type: 'GET'
    }).done(function(response) {
        window.host = response;

        setLoginInformation();

        window.username = $("#addlogin-usernameinput").val();
        window.password = $("#addlogin-passwordinput").val();
        
        console.log("Host: " + window.host + ", username: " + window.username + ", password: " + window.password);

        launchConnection();
    });
}

function setLoginInformation() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));

    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            value["username"] = $("#addlogin-usernameinput").val();
            value["password"] = $("#addlogin-passwordinput").val();
        }
    });

    remotefs.writeFileSync(serversPath, JSON.stringify(jsonToModify, null, 4));
}

function loadLoginInformation() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));

    var username = "";
    var password = "";
    
    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            username = value["username"];
            password = value["password"];
        }
    });

    console.log("Setting username to " + username);
    console.log("Setting password to " + password);
    
    $("#addlogin-usernameinput").val(username);
    $("#addlogin-passwordinput").val(password);
}

function connectToServer() {
    // Get ID of the selected server, which corresponds to its UUID in the json
    console.log("Connecting to server with UUID of " + getSelectedServer());

    setGameInfo(getSelectedServer());
    loadLoginInformation();
}

// If applicable, deselect currently selected server.
function deselectServer() {
    disableServerListButtons();
    $(".server-listing-entry").removeClass("bg-primary");
}

function createAccount(){
    var accountPage = window.ipAddress + "/en/Signup";
    console.log("Account page redirected: " + accountPage);

    window.open(accountPage);
}

$("#server-table").on("click", ".server-listing-entry", function (event) {
    enableServerListButtons();
    $(this).addClass("bg-primary").siblings().removeClass("bg-primary");
});

// QoL feature: if you double click on a server it will connect
$("#server-table").on("dblclick", ".server-listing-entry", function (event) {
    $(this).addClass("bg-primary").siblings().removeClass("bg-primary");
    connectToServer();
});

$("#of-editservermodal").on("show.bs.modal", function (e) {
    var jsonToModify = remotefs.readJsonSync(
        path.join(userData, "servers.json")
    );
    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            $("#editserver-descinput")[0].value = value["description"];
            $("#editserver-ipinput")[0].value = value["ip"];

            var versionIndex = -1;
            $.each($("#editserver-versionselect")[0], function (key, val) {
                if (val.text === value["version"]) {
                    versionIndex = key;
                }
            });
            $("#editserver-versionselect")[0].selectedIndex = versionIndex;
        }
    });
});

$("#of-deleteservermodal").on("show.bs.modal", function (e) {
    var result = serverArray.filter(function (obj) {
        return obj.uuid === getSelectedServer();
    })[0];
    $("#deleteserver-servername").html(result.description);
});
