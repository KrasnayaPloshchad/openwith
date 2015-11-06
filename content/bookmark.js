/* globals Components, PlacesUtils, PlacesUIUtils, Services, OpenWithCore */
var { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://openwith/openwith.jsm');

let acceptButton = document.documentElement.getButton('accept');
acceptButton.disabled = true;

let url = document.getElementById('url');
let title = document.getElementById('title');
let browser = document.getElementById('browser');
let folder = document.getElementById('folder');

url.oninput = function() {
	if (url.value) {
		let original = Services.io.newURI(url.value, null, null);
		title.value = PlacesUtils.history.getPageTitle(original) || url.value;
	}
	acceptButton.disabled = !url.value || !folder.selectedNode;
};
folder.onselect = function() {
	acceptButton.disabled = !url.value || !folder.selectedNode;
};

for (let entry of OpenWithCore.list) {
	if (!entry.hidden) {
		let menuitem = document.createElement('menuitem');
		menuitem.setAttribute('label', entry.name);
		menuitem.setAttribute('image', entry.icon);
		menuitem.setAttribute('value', (entry.auto ? 'auto.' : 'manual.') + entry.keyName);
		browser.menupopup.appendChild(menuitem);
	}
}
browser.selectedIndex = 0;

window.onload = function() {
	folder.place = 'place:excludeItems=1&excludeQueries=1&excludeReadOnlyFolders=1&folder=' +
		PlacesUIUtils.allBookmarksFolderId;
};

/* exported dialogAccept */
function dialogAccept() {
	if (url.value && folder.selectedNode) {
		let folderID = PlacesUtils.getConcreteItemId(folder.selectedNode);
		let uri = Services.io.newURI('openwith:' + browser.value + ':' + url.value, null, null);

		let nbs = Cc['@mozilla.org/browser/nav-bookmarks-service;1'].getService(Ci.nsINavBookmarksService);
		nbs.insertBookmark(folderID, uri, -1, title.value);
	} else {
		return false;
	}
}
