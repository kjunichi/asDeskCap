var ipc = require('ipc');
var fs = require('fs');
var spawn = require('child_process').spawn;

function getWin32ChromePath() {
  var path = [
    process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
      process.env.ProgramFiles + "\\Google\\Chrome\\Application\\chrome.exe"
    ];

  for(var i = 0; i < path.length; i++) {
      if(fs.existsSync(path[i])) {
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

var btn = document.getElementById("uploadBtn");
btn.addEventListener("click", function() {
  // 選択されたファイルをアップロードする
  alert("upload = " + uploadFilePath);
  if (uploadFilePath == "") {
    return;
  }

  var req = new XMLHttpRequest();
  //console.dir(req);
  req.open("POST", "http://localhost:3000/", true);
  req.onreadystatechange = function() {
    //readyState値は4で受信完了
    if (req.readyState == 4) {
      //コールバック
      //on_loaded(http);
      console.log("responseText" + req.responseText);
    }
  };
  //req.setRequestHeader("Content-Type","multipart/form-data");
  var formData = new FormData();
  formData.enctype = "multipart/form-data";
  console.log("1 uploadFilePath = " + getFileName(uploadFilePath[0]));
  var data = fs.readFileSync(uploadFilePath[0]);
  console.log("data.length = " + data.length);
  //var aryBuf = new ArrayBuffer(data.length);
  var longInt8View = new Uint8Array(data);
  //for(var i = 0; i < longInt8View.length; i++) {
  //	longInt8View[i] = data[i];
  //}

  var oBlob = new Blob([longInt8View.buffer]); //Blob(data);

  formData.append("theFile", oBlob, getFileName(uploadFilePath[0]));
  //formData.append("theFile",data,getFileName(uploadFilePath[0]));
  console.dir(formData);
  req.send(formData);
});

ipc.on('asynchronous-reply', function(arg) {
  console.dir(arg);
  uploadFilePath = arg;
  console.log("fileName = " + uploadFilePath);

});
var fileOpenBtn = document.getElementById("fileOpenBtn");
fileOpenBtn.addEventListener("click", function() {
  ipc.sendSync('openFileDialog');
});

function procKillChrome() {
  console.log("Now we needs no Chrome.");
  gChrome.kill();
}

function getFileName(path) {
  return path.split("/").slice(-1);
}
