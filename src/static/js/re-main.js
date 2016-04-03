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


function createEntry(data) {
	var filename = data.filename;
  var e = "<div class=\"file-entry\">";

	// icon section
	e += data.filename;
	e += "<br />";
	e += data.fullpath + " " + data.filesize;
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
				if (dataBase[i].filename.indexOf(filter) == -1)
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
