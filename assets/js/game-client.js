var gameRunning = false;

function onResize() {
    if (gameRunning == true) {
        var unity = document.getElementById("unityEmbed");
        unity.style.width = window.innerWidth + "px";
        unity.style.height = window.innerHeight + "px";
    }
}

function launchGame() {
    gameRunning = true;

    var sel = document.getElementById("of-serverselector");
    sel.remove();

    document.body.style.overflow = "hidden";

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

    var srcPath = window.assetUrl + "main.unity3d";
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
