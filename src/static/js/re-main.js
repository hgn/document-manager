'use strict';

const ipcRenderer = require('electron').ipcRenderer;

var filter = null;
var dataBase = null;


window.onload = function () {
}

ipcRenderer.on('asynchronous-reply', function(event, arg) {
	  //console.log(arg);
});

ipcRenderer.on('file-database-update', function(event, arg) {
	dataBase = arg;
  displayFiles();
});


function basename(path) {
    return path.replace(/\\/g,'/').replace( /.*\//, '' );
}
 
function dirname(path) {
    return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
}

function createEntry(data) {
	var filename = basename(data);
  var directory = dirname(data);
  var e = "<div class=\"file-entry\">";

	// icon section
	e += filename;
  e += "</div>\n";
	return e;
}

function displayFiles() {
		if (!dataBase)
			return;

    var final_string = "";

    var arrayLength = dataBase.length;
    for (var i = 0; i < arrayLength; i++) {
			if (filter) {
				if (dataBase[i].indexOf(filter) == -1)
					continue;
			}
			final_string += createEntry(dataBase[i]);
		}
   
    document.getElementById("file-content").innerHTML = final_string;
}

function edValueKeyPress() {
	var edValue = document.getElementById("edValue");
	var s = edValue.value;
  filter = s;

	ipcRenderer.send('asynchronous-message', s);

  displayFiles();
}
