const { ToggleButton } = require('sdk/ui/button/toggle');
const sdkPanels = require("sdk/panel");
const self = require("sdk/self");
const tabs = require("sdk/tabs");
const clipboard = require("sdk/clipboard");
const masterPasswordOperations = require("./data/modules/passwordStorageModule.js").masterPasswordModule;
const passwordStorageOperations = require("./data/modules/passwordStorageModule.js").passwordStorageModule;
const passwordSafeConnectionOperations = require("data/modules/passwordStorageModule.js").passwordSafeConnectionModule;
const loginModuleOperations = require("./data/modules/loginModule.js").loginModule;
const firstMasterPasswordInitModuleOperations = require("./data/modules/masterPasswordFirstEnterModule.js").masterPasswordFirstInitializationModule;
const generateNewPasswordModule = require("./data/modules/generateNewPasswordModule.js").generateNewPasswordModule;
const pwdgsmUtils = require("data/modules/utils.js").utils;
const passwordSafeConnectionModule = require("./data/modules/passApplicationModule.js").passwordSafeApplicationConnectModule;



var button = ToggleButton({
  id: "my-button",
  label: "PWD-GSM",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var myPanel = sdkPanels.Panel({
	width: 500,
	height: 250,
	contentURL: self.data.url("./UI/panel.html"),
	onHide: handleHide
});

function handleChange(state) {
	if (state.checked) {
		masterPasswordOperations.initalizeProcess();
		if (masterPasswordOperations.checkIfMasterPasswordIsSet()){
			if (masterPasswordOperations.sessionCheck()){
				console.log("There is a master password and there is session here. Redirecting main menu.");
				myPanel.port.emit("MAIN_MENU_REDIRECT", pwdgsmUtils.getRootURLFromFullTabURL(tabs.activeTab.url));
			}
			else{
				console.log("There is a master password but there is no session here. Redirecting login page.");
				myPanel.port.emit("LOGIN_PAGE_REDIRECT");
			}
		}
		else{
			console.log("There is no master password set operation done. Redirecting set master password page.");
			myPanel.port.emit("MASTER_PWD_DECISION_REDIRECT");
		}
	
		myPanel.show({
			position: button
		});
	}
}

require("sdk/system/unload").when(function(reason) {
	masterPasswordOperations.browserShutDownProcess();
	//masterPasswordOperations.resetSimpleStorage();
});

function handleHide() {
  button.state('window', {checked: false});
}

myPanel.port.on("SHOW_ALL_PWDS", function(){
	var allStoredPasswordMetadata = passwordStorageOperations.getAllSavedPasswordsMetadata();
	tabs.open({
		url : self.data.url("./UI/showAllPasswords.html"),
		onReady : function(tab){
			var worker = tab.attach({
				contentScriptFile : [self.data.url("./UI/assets/jquery-3.3.1.js"), self.data.url("./UI/showAllPasswordsPageHandler.js")]
			});
			worker.port.emit("SHOW_ALL_PWDS_RESULT", allStoredPasswordMetadata);
			worker.port.on("REGENERATE_PWD_FROM_DATA", function(obj){
				var reGeneratePasswordPhaseResult = generateNewPasswordModule.reGeneratePasswordFromSavedMetadata(obj.url, obj.username, true);
				worker.port.emit("REGENERATE_PWD_FROM_DATA_RESULT",reGeneratePasswordPhaseResult);
			});
			worker.port.on("DELETE_PWD_DATA", function(obj){
				var objectToSent = new Object();
				objectToSent.url = obj.url;
				objectToSent.username = obj.username;
				var deleteResult = passwordStorageOperations.removePasswordMetadataInfo(objectToSent);
				if (deleteResult.startsWith("FAIL")){
					worker.port.emit("DELETE_PWDS_FAIL_RESULT", deleteResults.split(":###:")[1]);
				}
				else{
					var reGetStoredPasswordMetadata = passwordStorageOperations.getAllSavedPasswordsMetadata();
					worker.port.emit("SHOW_ALL_PWDS_RESULT", reGetStoredPasswordMetadata);
				}
			});
			worker.port.on("SAVE_TO_PASSWORDSAFE",function(obj){
				var returnMessage = "OK";
				try{
					var reGeneratePasswordPhaseResult = generateNewPasswordModule.reGeneratePasswordFromSavedMetadata(obj.url, obj.username, false);
					if (reGeneratePasswordPhaseResult.startsWith("FAIL")){
						throw new Error("Re-Generation Error!");
					}
					var objectToSent = new Object();
					objectToSent.title = obj.url + " - " + obj.username;
					objectToSent.username = obj.username;
					objectToSent.password = reGeneratePasswordPhaseResult.split(":###:")[1];
					objectToSent.url = obj.url;
					
					passwordSafeConnectionModule.addPasswordDataToPasswordSafe(objectToSent, function(returnMessage){
						if (returnMessage.startsWith("FAIL")){
							throw new Error(returnMessage.split(":###:")[1]);
						}
						else{
							var savedUUID = returnMessage.split(":")[1].replace("\n","");
							var saveUUIDPhaseResult = passwordSafeConnectionOperations.saveUUIDForSavePasswordSafeData(objectToSent, savedUUID);
							if (saveUUIDPhaseResult.startsWith("FAIL")){
								throw new Error(saveUUIDPhaseResult.split(":")[1]);
							}
							returnMessage = "OK:###:" + objectToSent.url + ":###:" + objectToSent.username;
							worker.port.emit("SAVE_TO_PASSWORDSAFE_RESULT",returnMessage);
						}
					});
				}
				catch(err){
					returnMessage = "FAIL:###:" + err.message;
					worker.port.emit("SAVE_TO_PASSWORDSAFE_RESULT",returnMessage);
				}
			});
		}
	});
});

myPanel.port.on("INIT_MP", function (returnMessage){
	firstMasterPasswordInitModuleOperations.masterPasswordFirstInitializationPhaseHandler(returnMessage, myPanel);
});

myPanel.port.on("LOGIN", function (returnMessage){
	loginModuleOperations.loginPhaseHandler(returnMessage, myPanel);
});

myPanel.port.on("GENERATE_SAVE_CCB_PWD", function (returnObject){
	var returnMessage = generateNewPasswordModule.generateSaveAndCopyClipboardPasswordFromMetadataObject(returnObject);
	myPanel.port.emit("GENERATE_SAVE_CCB_PWD_RESULT",returnMessage);
});

myPanel.port.on("PASSWORDSAFE_CONFG", function(){
	var returnObject = passwordSafeConnectionModule.getPasswordSafeConfiguration();
	myPanel.port.emit("PASSWORDSAFE_CONFG_RESULT", returnObject);
});

myPanel.port.on("PASSWORDSAVE_CONFG_SAVE", function(objectToSave){
	var returnMessage = passwordSafeConnectionModule.savePasswordSafeConfiguration(objectToSave);
	console.log(returnMessage);
	myPanel.port.emit("PASSWORDSAVE_CONF_SAVE_RESULT", returnMessage);
});

myPanel.port.on("SHOW_ALL_PASSWORDSAFE_PWDS", function(){
	tabs.open({
		url : self.data.url("./UI/showAllPasswordSafePasswords.html"),
		onReady : function(tab){
			var worker = tab.attach({
				contentScriptFile : [self.data.url("./UI/assets/jquery-3.3.1.js"), self.data.url("./UI/showAllPasswordSafePasswordsPageHandler.js")]
			});
			passwordSafeConnectionModule.listAllDataFromPasswordSafe(function(returnObject){
				worker.port.emit("SHOW_ALL_PASSWORDSAFE_PWDS_RESULT", returnObject);
			});
			worker.port.on("COPY_TO_CLIPBOARD_FROM_PASSWORDSAFE", function(returnMessage){
				clipboard.set(returnMessage);
			});
		}
	});
});
