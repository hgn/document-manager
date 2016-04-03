'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = require('electron').ipcMain;

const shell = require('electron').shell;


const fs = require('fs');
const path = require('path');



let mainWindow;

var supported_suffixes = [
	// word files
	'.docx', '.doc', '.docm',

	// excel
	'.xls', '.xlxs', '.xltx',

	// powerpoint
	'.ptp', '.xptp',

	// misc
	'.tex', '.txt', '.md', '.svg'
];

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

function basename(path) {
	return path.replace(/\\/g,'/').replace( /.*\//, '' );
}

function dirname(path) {
	return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}

function fileentry(fullpath) {
	var e = new Object();
	e.filename = basename(fullpath);
	e.pathname = dirname(fullpath);
	e.fullpath = fullpath;

	var stats = fs.statSync(fullpath)
	e.filesize = stats.size;

	return e;
}

function isFileTypeSupported(fullpath) {
	for (var i = 0; i < supported_suffixes.length; i++) { 
		if (fullpath.endsWith(supported_suffixes[i]))
			return true;
	}

	return false;
}

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
					if (isFileTypeSupported(file)) {
						var entry = fileentry(file);
						results.push(entry);
					}
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
