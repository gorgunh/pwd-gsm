var masterPasswordOperations = require("data/modules/passwordStorageModule.js").masterPasswordModule;
var tabs = require("sdk/tabs");

function loginPhaseHandler(returnMessage, panelObject){
	var loginPhaseResult = masterPasswordOperations.loginWithMasterPassword(returnMessage);
	if (loginPhaseResult.startsWith("OK")){
		panelObject.port.emit("MAIN_MENU_REDIRECT", tabs.activeTab.url);
	}
	else {
		panelObject.port.emit("LOGIN_FAILED", loginPhaseResult.split(":###:")[1]);
	}
}

module.exports.loginModule = {
	loginPhaseHandler : loginPhaseHandler
}
