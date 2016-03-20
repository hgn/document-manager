'use strict';


const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

const shell = require('electron').shell;

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
	mainWindow.setMenu(null);

  mainWindow.loadURL('file://' + __dirname + '/../static/html/index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

var documentDatabase = null;

var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function createDocumentDatabase () {
  mainWindow.webContents.on('did-finish-load', function() {
		walk(process.cwd(), function(err, results) {
			if (err) throw err;
			console.log(results);
			mainWindow.webContents.send('file-database-update', results);
		});
  });
}

app.on('ready', createWindow);
app.on('ready', createDocumentDatabase);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on('asynchronous-message', function(event, arg) {
	event.sender.send('asynchronous-reply', arg);
});
