var simpleStorageObject = require("sdk/simple-storage");
var cryptoJSInstance = require("/node_modules/crypto-js/crypto-js.js");
var base64Instance = require("sdk/base64");
var pwdgsmUtils = require("data/modules/utils.js").utils;

var passwordObject = {
	isSessionOpen : false,
	encryptedPassword : null,
	passwordSafeInfo : {
		psafe3DatabasePath : null,
		DBPassword : null
	},
	storedPasswordsMetadata : new Array()
}
/*
 * Master Password Initalization and Login With Master Password Phase Block Start
 */
function checkIfMasterPasswordIsSet(){
	if (passwordObject.encryptedPassword == null){
		return false;
	}
	else{
		return true;
	}
}

function sessionOperation(operation){
	if (operation == "OPEN"){
		passwordObject.isSessionOpen = true;
	}
	else if (operation == "CLOSE"){
		passwordObject.isSessionOpen = false;
	}
}

function sessionCheck(){
	return passwordObject.isSessionOpen;
}

function initalizeProcess(){
	if (typeof simpleStorageObject.storage.pwdgsmObject == "undefined" || simpleStorageObject.storage.pwdgsmObject == null){
		passwordObject.isSessionOpen = false;
		passwordObject.encryptedPassword = null;
		passwordObject.storedPasswordsMetadata = new Array();
		simpleStorageObject.storage.pwdgsmObject = passwordObject;
	}
	else{
		passwordObject = simpleStorageObject.storage.pwdgsmObject;
	}
}

function browserShutDownProcess(){
	sessionOperation("CLOSE");
	simpleStorageObject.storage.pwdgsmObject = passwordObject; 
}

function setMasterPasswordFirstTime(userMasterPasswordInput){
	if (passwordObject.encryptedPassword == null){
		sessionOperation("OPEN");
		passwordObject.encryptedPassword = pwdgsmUtils.wordArrayToStringWithoutExtendedASCIICharacters(cryptoJSInstance.HmacSHA256(userMasterPasswordInput,"key/%93"));
		simpleStorageObject.storage.pwdgsmObject = passwordObject;
	}
	else{
		throw new Error('Master Password Already Set!');
	}
}

function loginWithMasterPassword(userMasterPasswordInput){
	if (passwordObject.encryptedPassword != null){
		if (pwdgsmUtils.wordArrayToStringWithoutExtendedASCIICharacters(cryptoJSInstance.HmacSHA256(userMasterPasswordInput,"key/%93")) == passwordObject.encryptedPassword){
			sessionOperation("OPEN");
			return "OK";
		}
		else{
			return "FAIL:###:Login Failed."
		}
	}
	else{
		return "FAIL:###:Master password is not set!";
	}
}

function getMasterPasswordHashedValue(){
	return passwordObject.encryptedPassword;
}

/*
 * Master Password Initalization and Login With Master Password Phase Block End
 */

function getAllSavedPasswordsMetadata(){
	return passwordObject.storedPasswordsMetadata;
}
/*
function getSavedPasswordsUsernameByURL(url){
	var index;
	var returnArray = new Array();
	try{
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].url == url){
				var savedPasswordListForThisURL = passwordObject.storedPasswordsMetadata[index].userSavedPasswordData;
				if (typeof savedPasswordListForThisURL == "undefined" || savedPasswordListForThisURL == null || savedPasswordListForThisURL.length == 0){
					throw new Error('There is no saved password metadata for this URL!');
				}
				else{
					var index2;
					for (index2 = 0; index2 < savedPasswordListForThisURL.length; index2++){
						returnArray.push(savedPasswordListForThisURL[index2].username);
					}
				}
			}
		}
	}
	catch(err){
		console.log(err.message);
		returnArray = null;
	}
	return returnArray;
}
*/
function saveUserPasswordsMetadata(passwordMetadataTransferObject){
	var index;
	var isFoundOnStorage = false;
	var returnMessage = "OK";
	try{
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].url == passwordMetadataTransferObject.url){
				var savedPasswordListForThisURL = passwordObject.storedPasswordsMetadata[index].userSavedPasswordData;
				if (typeof savedPasswordListForThisURL == "undefined" || savedPasswordListForThisURL == null || savedPasswordListForThisURL.length == 0){
					savedPasswordListForThisURL = new Array();
				}
				else{
					var index2;
					for (index2 = 0; index2 < savedPasswordListForThisURL.length; index2++){
						if (savedPasswordListForThisURL[index2].username == passwordMetadataTransferObject.username){
							throw new Error('This username is already defined for this URL.');
						}
					}
				}
				var passwordSaveObject = new Object();
				passwordSaveObject.username = passwordMetadataTransferObject.username;
				passwordSaveObject.passwordLength = parseInt(passwordMetadataTransferObject.passwordLength);
				passwordSaveObject.isUpperCaseAllowed = passwordMetadataTransferObject.isUpperCaseAllowed;
				passwordSaveObject.isSpecialCharactersAllowed = passwordMetadataTransferObject.isSpecialCharactersAllowed;
				passwordSaveObject.saveTimeStamp = new Date();
				passwordSaveObject.passwordSafeUUID = null;
				
				
				savedPasswordListForThisURL.push(passwordSaveObject);
				passwordObject.storedPasswordsMetadata[index].userSavedPasswordData = savedPasswordListForThisURL;
				isFoundOnStorage = true;
				break;
			}
		}
		if (!isFoundOnStorage){
			var passwordMetadataStorageObject = new Object();
			passwordMetadataStorageObject.url = passwordMetadataTransferObject.url;
			
			var savedPasswordListForThisURL = new Array();
			
			var passwordSaveObject = new Object();
			passwordSaveObject.username = passwordMetadataTransferObject.username;
			passwordSaveObject.passwordLength = parseInt(passwordMetadataTransferObject.passwordLength);
			passwordSaveObject.isUpperCaseAllowed = passwordMetadataTransferObject.isUpperCaseAllowed;
			passwordSaveObject.isSpecialCharactersAllowed = passwordMetadataTransferObject.isSpecialCharactersAllowed;
			passwordSaveObject.saveTimeStamp = new Date();
			passwordSaveObject.passwordSafeUUID = null;
			
			savedPasswordListForThisURL.push(passwordSaveObject);
			
			passwordMetadataStorageObject.userSavedPasswordData = savedPasswordListForThisURL;
			
			passwordObject.storedPasswordsMetadata.push(passwordMetadataStorageObject);
		}
		
		simpleStorageObject.storage.pwdgsmObject = passwordObject;
		
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}
function removePasswordMetadataInfo(passwordMetadataTransferObject){
	var returnMessage = "OK";
	try{
		var index = 0;
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].url == passwordMetadataTransferObject.url){
				var newUserSavedPasswordListForThisURL = new Array();
				var oldUserSavedPasswordListForThisURL = passwordObject.storedPasswordsMetadata[index].userSavedPasswordData;
				var index2 = 0;
				for (index2 = 0; index2 < oldUserSavedPasswordListForThisURL.length; index2++){
					if (oldUserSavedPasswordListForThisURL[index2].username != passwordMetadataTransferObject.username){
						newUserSavedPasswordListForThisURL.push(oldUserSavedPasswordListForThisURL[index2]);
					}
				}
				passwordObject.storedPasswordsMetadata[index].userSavedPasswordData = newUserSavedPasswordListForThisURL;
			}
		}
		
		index = 0;
		var newStoredPasswordsMetadata = new Array();
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].userSavedPasswordData.length != 0){
				newStoredPasswordsMetadata.push(passwordObject.storedPasswordsMetadata[index]);
			}
		}
		passwordObject.storedPasswordsMetadata = newStoredPasswordsMetadata;
		
		simpleStorageObject.storage.pwdgsmObject = passwordObject;
		
		
	} catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
	/*
	var returnMessage = "OK:###:" + passwordMetadataTransferObject.url + ":###:" + passwordMetadataTransferObject.username;
	var index;
	var isFoundOnStorage = false;
	try{
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].url == passwordMetadataTransferObject.url){
				var savedPasswordListForThisURL = passwordObject.storedPasswordsMetadata[index].userSavedPasswordData;
				var newSavedPasswordListForThisURL;
				if (typeof savedPasswordListForThisURL == "undefined" || savedPasswordListForThisURL == null || savedPasswordListForThisURL.length == 0){
					throw new Error('Corrupted Metadata!');
				}
				else{
					var index2;
					newSavedPasswordListForThisURL = new Array();
					for (index2 = 0; index2 < savedPasswordListForThisURL.length; index2++){
						if (savedPasswordListForThisURL[index2].username != passwordMetadataTransferObject.username){
							newSavedPasswordListForThisURL.push(savedPasswordListForThisURL[index2]);
						}
						else{
							isFoundOnStorage = true;
						}
					}
				}
				if (isFoundOnStorage){
					passwordObject.storedPasswordsMetadata[index].userSavedPasswordData = newSavedPasswordListForThisURL;
					break;
				}
			}
		}
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
	*/
}
/*
 * This is created for only test issues. 
 */
function resetSimpleStorage(){
	delete simpleStorageObject.storage.pwdgsmObject;
}

function setPasswordSafeInfoData(psafe3DatabasePath, DBPassword){
	passwordObject.passwordSafeInfo.psafe3DatabasePath = psafe3DatabasePath;
	passwordObject.passwordSafeInfo.DBPassword = DBPassword;
	simpleStorageObject.storage.pwdgsmObject = passwordObject;
}

function getPasswordSafeInfoData(){
	return passwordObject.passwordSafeInfo;
}

function saveUUIDForSavePasswordSafeData(passwordMetadataTransferObject, UUID){
	var returnMessage = "OK";
	var index;
	var isFoundOnStorage = false;
	try{
		for (index = 0; index < passwordObject.storedPasswordsMetadata.length; index++){
			if (passwordObject.storedPasswordsMetadata[index].url == passwordMetadataTransferObject.url){
				var savedPasswordListForThisURL = passwordObject.storedPasswordsMetadata[index].userSavedPasswordData;
				if (typeof savedPasswordListForThisURL == "undefined" || savedPasswordListForThisURL == null || savedPasswordListForThisURL.length == 0){
					throw new Error('Corrupted Metadata!');
				}
				else{
					var index2;
					for (index2 = 0; index2 < savedPasswordListForThisURL.length; index2++){
						if (savedPasswordListForThisURL[index2].username == passwordMetadataTransferObject.username){
							if (savedPasswordListForThisURL[index2].passwordSafeUUID != null){
								throw new Error('This metadata already stored on PasswordSafe!');
							}
							savedPasswordListForThisURL[index2].passwordSafeUUID = UUID;
							isFoundOnStorage = true;
							break;
						}
					}
				}
				if (isFoundOnStorage){
					passwordObject.storedPasswordsMetadata[index].userSavedPasswordData = savedPasswordListForThisURL;
					break;
				}
			}
		}
		if (!isFoundOnStorage){
			throw new Error('This metadata not found on storage!');
		}
		
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}

module.exports.passwordSafeConnectionModule = {
	setPasswordSafeInfoData : setPasswordSafeInfoData,
	getPasswordSafeInfoData : getPasswordSafeInfoData,
	saveUUIDForSavePasswordSafeData : saveUUIDForSavePasswordSafeData
}

module.exports.passwordStorageModule = {
	getAllSavedPasswordsMetadata : getAllSavedPasswordsMetadata,
	saveUserPasswordsMetadata : saveUserPasswordsMetadata,
	removePasswordMetadataInfo : removePasswordMetadataInfo
}

module.exports.masterPasswordModule = {
	checkIfMasterPasswordIsSet : checkIfMasterPasswordIsSet,
	sessionOperation : sessionOperation,
	sessionCheck : sessionCheck,
	initalizeProcess : initalizeProcess,
	browserShutDownProcess : browserShutDownProcess,
	setMasterPasswordFirstTime : setMasterPasswordFirstTime,
	resetSimpleStorage : resetSimpleStorage,
	loginWithMasterPassword : loginWithMasterPassword,
	getMasterPasswordHashedValue : getMasterPasswordHashedValue
}
