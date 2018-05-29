const { spawn } = require("sdk/system/child_process");
const { exec } = require("sdk/system/child_process");
const fileIO = require("sdk/io/file");
const { env } = require("sdk/system/environment");
const passwordSafeConnectionOperations = require("data/modules/passwordStorageModule.js").passwordSafeConnectionModule;

function isExternalPythonModuleConfigured(){
	var returnMessage = "OK";
	try{
		var passwordSafeConnectionInfo = passwordSafeConnectionOperations.getPasswordSafeInfoData();
		if (passwordSafeConnectionInfo.psafe3DatabasePath == null || passwordSafeConnectionInfo.DBPassword == null){
			throw new Error("PasswordSafe Connection Info are not set!");
		}
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
};

function isExternalPythonModuleInstalled(){
	var returnMessage = "OK";
	try{
		var externalPythonModulePath = env.HOME + "/pwdgsm/pwd-gsm-ext.py";
		if (!fileIO.exists(externalPythonModulePath)){
			throw new Error("External Python Module is not in " + env.HOME + "/pwdgsm/ !");
		}
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}

function savePasswordSafeConfiguration(objectToSave){
	var returnMessage = "OK";
	try{
		var configurationCheckResult = isExternalPythonModuleInstalled();
		if (configurationCheckResult.startsWith("FAIL")){
			throw new Error(configurationCheckResult.split(":###:")[1]);
		}
		passwordSafeConnectionOperations.setPasswordSafeInfoData(objectToSave.psafe3DatabasePath, objectToSave.DBPassword);
	}
	catch (err){
		returnMessage = "FAIL:###:" + err.message;
	}
	return returnMessage;
}

function getPasswordSafeConfiguration(){
	return passwordSafeConnectionOperations.getPasswordSafeInfoData();
}

function addPasswordDataToPasswordSafe(objectToSent, callbackFunction){
	var returnMessage = "";
	var passwordSafeConnectionInfo = passwordSafeConnectionOperations.getPasswordSafeInfoData();
	var configurationCheckResult = isExternalPythonModuleConfigured();
	if (configurationCheckResult.startsWith("FAIL")){
		returnMessage = configurationCheckResult;
		callbackFunction(returnMessage);
	}
	var installationCheckResult = isExternalPythonModuleInstalled();
	if (installationCheckResult.startsWith("FAIL")){
		returnMessage = installationCheckResult;
		callbackFunction(returnMessage);
	}
	else{
		console.log("/usr/bin/python " + env.HOME + "/pwdgsm/pwd-gsm-ext.py " + passwordSafeConnectionInfo.psafe3DatabasePath + " " + passwordSafeConnectionInfo.DBPassword + " insert '" + objectToSent.title + "' '" + objectToSent.username + "' '" + objectToSent.password + "' '" + objectToSent.url + "'");
		exec("/usr/bin/python " + env.HOME + "/pwdgsm/pwd-gsm-ext.py " + passwordSafeConnectionInfo.psafe3DatabasePath + " " + passwordSafeConnectionInfo.DBPassword + " insert '" + objectToSent.title + "' '" + objectToSent.username + "' '" + objectToSent.password + "' '" + objectToSent.url + "'", {maxBuffer: 1024 * 1024}, function(error, stdout, stderr){
			console.log(stdout);
			callbackFunction(stdout);
		});
	}
}

function listAllDataFromPasswordSafe(callbackFunction){
	var returnObject = new Object();
	var passwordSafeConnectionInfo = passwordSafeConnectionOperations.getPasswordSafeInfoData();
	var configurationCheckResult = isExternalPythonModuleConfigured();
	if (configurationCheckResult.startsWith("FAIL")){
		returnObject.returnStatus = "FAIL";
		returnObject.returnData = configurationCheckResult.split(":###:")[1];
		callbackFunction(returnObject);
	}
	var installationCheckResult = isExternalPythonModuleInstalled();
	if (installationCheckResult.startsWith("FAIL")){
		returnObject.returnStatus = "FAIL";
		returnObject.returnData = installationCheckResult.split(":###:")[1];
		callbackFunction(returnObject);
	}
	else{
		exec("/usr/bin/python " + env.HOME + "/pwdgsm/pwd-gsm-ext.py " + passwordSafeConnectionInfo.psafe3DatabasePath + " " + passwordSafeConnectionInfo.DBPassword + " listall", {maxBuffer: 1024 * 1024}, function(error, stdout, stderr){
			console.log(stdout);
			try{
				returnObject.returnStatus = "OK";
				returnObject.returnData = JSON.parse(stdout);
			}
			catch(err){
				returnObject.returnStatus = "FAIL";
				if (stdout.startsWith("FAIL")){
					returnObject.returnData = stdout.split(":")[1];
				}
				else{
					returnObject.returnData = err.message;
				}
				
			}
			callbackFunction(returnObject);
		});
	}
}

module.exports.passwordSafeApplicationConnectModule = {
	isExternalPythonModuleConfigured : isExternalPythonModuleConfigured,
	isExternalPythonModuleInstalled : isExternalPythonModuleInstalled,
	savePasswordSafeConfiguration : savePasswordSafeConfiguration,
	getPasswordSafeConfiguration : getPasswordSafeConfiguration,
	addPasswordDataToPasswordSafe : addPasswordDataToPasswordSafe,
	listAllDataFromPasswordSafe : listAllDataFromPasswordSafe
}
