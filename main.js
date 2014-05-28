var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var dialog = require('dialog');
var ipc = require('ipc');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;


// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  //app.commandLine.appendSwitch("js-flags","--harmony_collections");
  app.commandLine.appendSwitch("js-flags", "--harmony");
  app.commandLine.appendSwitch("--enable-usermedia-screen-capturing");
  app.commandLine.appendSwitch("--ignore-certificate-errors");
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  ipc.on('openFileDialog', function(event, arg) {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    }, function(filePath) {
      console.log("filePath = " + filePath);
      event.sender.send('asynchronous-reply', filePath);
    });
    event.returnValue = "OK";
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  //mainWindow.loadUrl('file://' + __dirname + '/webrtc.html');
  //mainWindow.loadUrl('about:blank');
	mainWindow.toggleDevTools();
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
