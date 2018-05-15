var masterPasswordOperations = require("data/modules/passwordStorageModule.js").masterPasswordModule;
var self = require("sdk/self");
var tabs = require("sdk/tabs");

function masterPasswordFirstInitializationPhaseHandler(returnMessage, panelObject){
	try{
		masterPasswordOperations.setMasterPasswordFirstTime(returnMessage);
		panelObject.port.emit("MAIN_MENU_REDIRECT", tabs.activeTab.url);
	} catch (err){
		//TODO: Exception Handling!!
	}
}

module.exports.masterPasswordFirstInitializationModule = {
	masterPasswordFirstInitializationPhaseHandler : masterPasswordFirstInitializationPhaseHandler
}
