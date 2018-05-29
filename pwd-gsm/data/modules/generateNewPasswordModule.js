var masterPasswordOperations = require("data/modules/passwordStorageModule.js").masterPasswordModule;
var passwordStorageOperations = require("data/modules/passwordStorageModule.js").passwordStorageModule;
var cryptoJSInstance = require("/node_modules/crypto-js/crypto-js.js");
var clipboard = require("sdk/clipboard");
var pwdgsmUtils = require("data/modules/utils.js").utils;


function reGeneratePasswordFromSavedMetadata(url, username, willCopyToClipboard){
	var returnMessage = "";
	var isFoundOnLocalStorage = false;
	var generatedSHA1HmacPassword;
	try{
		var allSavedPasswordMetadata = passwordStorageOperations.getAllSavedPasswordsMetadata();
		if (typeof allSavedPasswordMetadata == "undefined" || allSavedPasswordMetadata.length == 0){
			throw new Error("System Error");
		}
		var i,j;
		for (i = 0; i < allSavedPasswordMetadata.length; i++){
			if (allSavedPasswordMetadata[i].url == url){
				for (j = 0; j < allSavedPasswordMetadata[i].userSavedPasswordData.length; j++){
					if (allSavedPasswordMetadata[i].userSavedPasswordData[j].username == username){
						isFoundOnLocalStorage = true;
						var masterPasswordHashedValue = masterPasswordOperations.getMasterPasswordHashedValue();
						var passwordWillBeHashed = masterPasswordHashedValue.substring(0,10) + '$' + username + '$' + url;
						generatedSHA1HmacPassword = pwdgsmUtils.wordArrayToStringWithoutExtendedASCIICharacters(cryptoJSInstance.HmacSHA256(passwordWillBeHashed,"key/%93"));
						//console.log(pwdgsmUtils.eliminateSpecialCharactersAndReplaceThemToDesiredCharacters(generatedSHA1HmacPassword));
						generatedSHA1HmacPassword = generatedSHA1HmacPassword.substring(0, allSavedPasswordMetadata[i].userSavedPasswordData[j].passwordLength);
						if (!allSavedPasswordMetadata[i].userSavedPasswordData[j].isSpecialCharactersAllowed){
							generatedSHA1HmacPassword = pwdgsmUtils.eliminateSpecialCharactersAndReplaceThemToDesiredCharacters(generatedSHA1HmacPassword);
						}
						if (!allSavedPasswordMetadata[i].userSavedPasswordData[j].isUpperCaseAllowed){
							generatedSHA1HmacPassword = generatedSHA1HmacPassword.toLowerCase();
						}
						generatedSHA1HmacPassword = generatedSHA1HmacPassword.replace(String.fromCharCode(92),String.fromCharCode(47)).replace(String.fromCharCode(39),String.fromCharCode(34));
						break;
					}
				}
				break;
			}
		}
		if (!isFoundOnLocalStorage){
			throw new Error("This metadata is not found on system!");
		}
		returnMessage = "OK:###:" + generatedSHA1HmacPassword;
		console.log(returnMessage);
		if (willCopyToClipboard){
			clipboard.set(generatedSHA1HmacPassword);
		}
	} catch(err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}

function generateSaveAndCopyClipboardPasswordFromMetadataObject(userInputObject){
	var returnMessage = "OK";
	try{
		var masterPasswordHashedValue = masterPasswordOperations.getMasterPasswordHashedValue();
		var passwordWillBeHashed = masterPasswordHashedValue.substring(0,10) + '$' + userInputObject.username + '$' + userInputObject.url;
		
		var generatedSHA1HmacPassword = pwdgsmUtils.wordArrayToStringWithoutExtendedASCIICharacters(cryptoJSInstance.HmacSHA256(passwordWillBeHashed,"key/%93"));
		
		generatedSHA1HmacPassword = generatedSHA1HmacPassword.substring(0, parseInt(userInputObject.passwordLength));
		
		if (!userInputObject.isSpecialCharactersAllowed){
			generatedSHA1HmacPassword = pwdgsmUtils.eliminateSpecialCharactersAndReplaceThemToDesiredCharacters(generatedSHA1HmacPassword);
		}
		
		if (!userInputObject.isUpperCaseAllowed){
			generatedSHA1HmacPassword = generatedSHA1HmacPassword.toLowerCase();
		}
		generatedSHA1HmacPassword = generatedSHA1HmacPassword.replace(String.fromCharCode(92),String.fromCharCode(47)).replace(String.fromCharCode(39),String.fromCharCode(34));
		
		var passwordStorageOperationReturnString = passwordStorageOperations.saveUserPasswordsMetadata(userInputObject);
		if (!passwordStorageOperationReturnString.startsWith("OK")){
			throw new Error(passwordStorageOperationReturnString.split(":###:")[1]);
		}
		
		clipboard.set(generatedSHA1HmacPassword);
		console.log(generatedSHA1HmacPassword);
		
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}

module.exports.generateNewPasswordModule = {
	generateSaveAndCopyClipboardPasswordFromMetadataObject : generateSaveAndCopyClipboardPasswordFromMetadataObject,
	reGeneratePasswordFromSavedMetadata : reGeneratePasswordFromSavedMetadata
}
