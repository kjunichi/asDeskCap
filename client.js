var ipc = require('ipc');
var fs = require('fs');
var spawn = require('child_process').spawn;
var remote = require('remote');
var path = require('path');
var shell = require('shell');

function addVideo(file) {
  console.log(file);
  var vtag = document.createElement("video");
  vtag.src = "http://localhost:3000" + file.replace(__dirname + "/public/uploads", "/uploads");
  console.log("v.src = " + vtag.src);
  vtag.setAttribute("controls", "");
  var list = document.getElementById("videos");

  list.appendChild(vtag);

  // ウィンドウを前面にもってくる
  remote.getCurrentWindow().hide();
  remote.getCurrentWindow().show();
  shell.showItemInFolder(path.resolve(file));
}

function getWin32ChromePath() {
  var path = [
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
    process.env.ProgramFiles + "\\Google\\Chrome\\Application\\chrome.exe"
  ];

  for (var i = 0; i < path.length; i++) {
    if (fs.existsSync(path[i])) {
      return path[i];
    }
  }
  return null;
}

var chromeRuntimes = {
  win32: getWin32ChromePath(),
  darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  linux: "" //頑張ってください
};

var uploadFilePath = "";
var gChrome;

var capBtn = document.getElementById("desktopCapBtn");
capBtn.addEventListener("click", function() {
  gChrome = spawn(chromeRuntimes[process.platform], [
    "--app=https://localhost:4430/webrtc.html", 　 // シンプルなウィンドウでURLを開く
    "--enable-usermedia-screen-capturing", // デスクトップキャプチャー機能を有効
    "--ignore-certificate-errors", 　 // オレオレ証明書の警告を無効
    "--window-size=320,128", 　 // キャプチャーボタンに必要な小さ目のサイズを指定
    "--user-data-dir=" + __dirname + "/chromeStuff" //
  ]);
});

function procKillChrome() {
  console.log("Now we needs no Chrome.");
  gChrome.kill();
}

function getFileName(path) {
  return path.split("/").slice(-1);
}
