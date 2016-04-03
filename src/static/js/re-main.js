'use strict';

const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;

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

function filetypeIcon(filetype) {
	switch (filetype) {
		case "DOC":
			return "../../assets/icons/x-doc.png";
			break;
		case "PDF":
			return "../../assets/icons/x-pdf.png";
			break;
		case "XLS":
			return "../../assets/icons/x-xls.png";
			break;
		case "PTP":
			return "../../assets/icons/x-ptp.png";
			break;
		case "UNKNOWN":
			return "../../assets/icons/x-unknown.png";
			break;
	}
}

function clickhandler(path) {
	shell.showItemInFolder(path);
}


function createEntry(data) {
	var filename = data.filename;
  var e = "<div class=\"tr\" onclick=\"clickhandler('" + data.fullpath + "')\">";

	// icon section
	e += "<div class=\"td\">";
	e += "<img src=\"" + filetypeIcon(data.filetype) + "\" width=\"20\", height=\"20\"/>";
	e += "</div>";
	e += "<div class=\"td\">";
	e += data.filename;
	e += "<br />";
	e += data.fullpath + " " + data.filesize;
	e += "</div>";
  e += "</div>\n";
	return e;
}

function displayFiles() {
		if (!dataBase)
			return;

    var final_string = "<div class=\"table\">";

    var arrayLength = dataBase.length;
		for (var i = 0; i < arrayLength; i++) {
			if (filter) {
				if (dataBase[i].filename.indexOf(filter) == -1)
					continue;
			}
			final_string += createEntry(dataBase[i]);
		}

		final_string += "</div>";
   
    document.getElementById("file-content").innerHTML = final_string;
}

function edValueKeyPress() {
	var edValue = document.getElementById("edValue");
	var s = edValue.value;
  filter = s;

	ipcRenderer.send('asynchronous-message', s);

  displayFiles();
}
