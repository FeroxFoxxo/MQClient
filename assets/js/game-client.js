var gameRunning = false;
var query_string = "";

var projName = "monk";
var cash = "nic";

function onResize() {
    if (gameRunning == true) {
        var unity = document.getElementById("unityEmbed");
        unity.style.width = window.innerWidth + "px";
        unity.style.height = window.innerHeight + "px";
    }
}

projName += "eyqu";
cash += "kca";

function GetUnity() {
    console.log("Accessing GetUnity();");
    return document.getElementById("unityEmbed");
}

projName += "est";
cash += "sh";

function launchGame() {
    gameRunning = true;

    var sel = document.getElementById("of-serverselector");
    sel.remove();

    document.body.style.overflow = "hidden";

    var url = window.ipAddress;
    query_string = "";

    var properties = [
        { key: "login.auto", value: "true" },

        { key: "login.host", value: window.host },
        { key: "login.user", value: window.username },
        { key: "login.sid", value: window.password },

        { key: "asset.log", value: "true" },
        { key: "asset.disableversioning", value: "true" },

        // Asset Types / Bundles -> Levels // NavMesh // XML

        { key: "asset.bundle", value: url + "/Client/Bundles" },
        { key: "asset.audio", value: url + "/Client/Audio" },

        { key: "logout.url", value: url + "/Logout" },

        { key: "mysql.datasource", value: "data" },
        { key: "mysql.username", value: "username" },
        { key: "mysql.password", value: "password" },
        { key: "mysql.database", value: "database" },

        { key: "tools.urlbase", value: url + "/Tools" },
        { key: "branch.name", value: "Mainline" },

        { key: projName + ".unity.cache.domain", value: url + "/Cache" },
        { key: projName + ".unity.cache.license", value: "UNKNOWN" },
        { key: projName + ".unity.cache.size", value: "0" },
        { key: projName + ".unity.cache.expiration", value: "0" },

        { key: projName + ".unity.downloadretrydelay", value: "1" },
        { key: projName + ".unity.downloadretriesmax", value: "10" },
        { key: projName + ".unity.enablecacheworkaround", value: "false" },
        { key: projName + ".unity.enableclockdriftprediction", value: "true" },
        { key: projName + ".unity.networktimeout", value: "120" },

        { key: projName + ".unity.screenstatus.fullscreen", value: "true" },

        { key: projName + ".unity.url." + cash, value: url + "/Cash" },
        { key: projName + ".unity.url.membership", value: url + "/Membership" },

        { key: projName + ".unity.url.crisp.host", value: url + "/Chat/" },
        {
            key: projName + ".unity.url.crisp.app",
            value: "CrispAutoSuggestProxy",
        },
        {
            key: projName + ".unity.url.crisp.service.whitelist",
            value: "WordList?group=",
        },
        {
            key: projName + ".unity.url.crisp.service.phrasecheck",
            value: "PhraseCheck",
        },

        { key: projName + ".jabber.port", value: "5222" },
        { key: projName + ".jabber.crossdomain", value: "5229" },
        { key: projName + ".jabber.domain", value: url + "/Jabber" },

        { key: "game.cacheversion", value: "0" },
        { key: "game.url", value: url + "/Game" },

        { key: "chat.disable", value: "false" },

        { key: "project.name", value: "MQReawaken" },

        { key: "simulate.webplayer", value: "true" },
        { key: "simulate.sharder", value: "true" },
    ];

    for (var i = 0; i < properties.length; i++) {
        query_string += "&" + properties[i].key + "&" + properties[i].value;
    }

    console.log("Query String: " + query_string);

    var object = document.createElement("object");

    object.setAttribute("id", "unityObject");
    object.setAttribute("width", "800");
    object.setAttribute("height", "600");

    var embed = document.createElement("embed");

    embed.setAttribute("type", "application/vnd.unity");

    embed.setAttribute(
        "pluginspage",
        "http://www.unity3d.com/unity-web-player-3.x"
    );

    var srcPath = url + "/api/getGame/" + window.version;
    console.log("UnityURL: " + srcPath);

    embed.setAttribute("id", "unityEmbed");
    embed.setAttribute("width", "800");
    embed.setAttribute("height", "600");
    embed.setAttribute("src", srcPath);
    embed.setAttribute("bordercolor", "000000");
    embed.setAttribute("backgroundcolor", "000000");
    embed.setAttribute("disableContextMenu", true);
    embed.setAttribute("textcolor", "ccffff");
    embed.setAttribute("logoimage", "assets/img/unity-mqr.png");
    embed.setAttribute("progressbarimage", "assets/img/unity-loadingbar.png");
    embed.setAttribute(
        "progressframeimage",
        "assets/img/unity-loadingframe.png"
    );

    var div = document.getElementById("client");
    object.appendChild(embed);
    div.appendChild(object);

    document.title = "MQClient";

    onResize();
}
