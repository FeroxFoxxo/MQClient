var remote = require("remote");
var remotefs = remote.require("fs-extra");
var path = remote.require("path");

var userData = remote.require("app").getPath("userData");
var serversPath = path.join(userData, "servers.json");

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

    server["username"] = "";
    server["password"] = "";
    server["version"] = "";

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

            var cellCount = document.createElement("td");
            cellCount.textContent = "Loading...";
            cellCount.className = "text-monospace";

            var ajaxUrl = value.ip + "/api/getPlayers";

            console.log("Loading player count from " + ajaxUrl);

            $.ajax({
                url: ajaxUrl,
                type: "GET",
            }).done(function (response) {
                cellCount.textContent = response;
            });

            row.appendChild(cellName);
            row.appendChild(cellCount);

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

    // game-client.js needs to access this
    window.ipAddress = result.ip;

    console.log("User data path: " + userData);
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
    console.log("Sending host request to " + ajaxUrl);

    $.ajax({
        url: ajaxUrl,
        type: "GET",
    }).done(function (response) {
        window.host = response;

        setLoginInformation();

        window.username = $("#addlogin-usernameinput").val();
        window.password = $("#addlogin-passwordinput").val();
        window.version = $("#addlogin-versionselect option:selected").text();

        console.log(
            "Host: " +
                window.host +
                ", username: " +
                window.username +
                ", password: " +
                window.password +
                ", version: " +
                window.version
        );

        launchConnection();
    });
}

function setLoginInformation() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));

    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            value["username"] = $("#addlogin-usernameinput").val();
            value["password"] = $("#addlogin-passwordinput").val();
            value["version"] = $(
                "#addlogin-versionselect option:selected"
            ).text();
        }
    });

    remotefs.writeFileSync(serversPath, JSON.stringify(jsonToModify, null, 4));
}

function loadLoginInformation() {
    var jsonToModify = JSON.parse(remotefs.readFileSync(serversPath));

    var username = "";
    var password = "";
    var version = "";

    $.each(jsonToModify["servers"], function (key, value) {
        if (value["uuid"] == getSelectedServer()) {
            username = value["username"];
            password = value["password"];
            version = value["version"];

            var ajaxUrl = window.ipAddress + "/api/getVersions";
            console.log("Sending version request to " + ajaxUrl);

            console.log("Found previous version " + version);

            $.ajax({
                url: ajaxUrl,
                type: "GET",
            }).done(function (response) {
                versionArray = response["versions"];

                console.log(
                    "Found versions: " + versionArray + " from " + response
                );

                var defaultVersion = response["defaultVersion"];

                $("#addlogin-defaultversion").text(defaultVersion);

                console.log("Found default version: " + defaultVersion);

                console.log("Attempting to set version to " + version);

                if (isEmpty(version)) {
                    version = defaultVersion;
                    console.log(
                        "Version was empty! Setting to default " +
                            defaultVersion
                    );
                }
                {
                    console.log("Setting version " + version + " in list...");
                }

                $.each(versionArray, function (key, value) {
                    console.log("Adding option: " + value);
                    var option = new Option(value, "val");

                    $(option).appendTo("#addlogin-versionselect");

                    if (value == version) $(option).prop("selected", true);
                });
            });
        }
    });

    console.log("Setting username to " + username);
    console.log("Setting password to " + password);

    $("#addlogin-usernameinput").val(username);
    $("#addlogin-passwordinput").val(password);
}

function isEmpty(str) {
    return !str || str.length === 0;
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

function createAccount() {
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
        }
    });
});

$("#of-deleteservermodal").on("show.bs.modal", function (e) {
    var result = serverArray.filter(function (obj) {
        return obj.uuid === getSelectedServer();
    })[0];
    $("#deleteserver-servername").html(result.description);
});
