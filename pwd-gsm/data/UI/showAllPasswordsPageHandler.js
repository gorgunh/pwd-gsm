self.port.on("SHOW_ALL_PWDS_RESULT", function(returnArray){
	console.log("enter");
	var tableDOMString = "";
	$('#all_passwords_table tr').remove();
	var i;
	for (i = 0; i < returnArray.length; i++){
		tableDOMString += "<tr>"
						+	"<td width = '200px'>" + returnArray[i].url + "</td>"
						+	"<td width = '700px'><table border = '1'>"
		var j;
		for (j = 0; j < returnArray[i].userSavedPasswordData.length; j++){
			tableDOMString += "<tr>"
							+	"<td width = '200px'>" + returnArray[i].userSavedPasswordData[j].username + "</td>"
							+	"<td width = '200px'><input type='button' value = 'Copy To Clipboard' id = 'copyClipboard:###:" + returnArray[i].url + ":###:" + returnArray[i].userSavedPasswordData[j].username +"'></td>";
			if (returnArray[i].userSavedPasswordData[j].passwordSafeUUID != null){
			tableDOMString += 	"<td width = '200px'><input type='button' value = 'Save To PasswordStore' id = 'saveToPasswordSafe:###:" + returnArray[i].url + ":###:" + returnArray[i].userSavedPasswordData[j].username +"' disabled></td>";
			}
			else{
			tableDOMString += 	"<td width = '200px'><input type='button' value = 'Save To PasswordStore' id = 'saveToPasswordSafe:###:" + returnArray[i].url + ":###:" + returnArray[i].userSavedPasswordData[j].username +"'></td>";
			}
			tableDOMString += 	"<td width = '100px'><input type='button' value = 'Delete' id = 'deletePasswordMetadata:###:" + returnArray[i].url + ":###:" + returnArray[i].userSavedPasswordData[j].username +"'></td>";
			tableDOMString += "</tr>";
		}
		tableDOMString += "</table></td></tr>";
	}
	$('#all_passwords_table').html(tableDOMString);
	$('input[id^="copyClipboard"]').click(function(event){
		var splitArray = event.target.id.split(":###:");
		var senderObject = new Object();
		senderObject.url = splitArray[1];
		senderObject.username = splitArray[2];
		self.port.emit("REGENERATE_PWD_FROM_DATA",senderObject);
	});
	$('input[id^="saveToPasswordSafe"]').click(function(event){
		var splitArray = event.target.id.split(":###:");
		var senderObject = new Object();
		senderObject.url = splitArray[1];
		senderObject.username = splitArray[2];
		self.port.emit("SAVE_TO_PASSWORDSAFE",senderObject);
	});
	$('input[id^="deletePasswordMetadata"]').click(function(event){
		if (confirm ("Are you sure to delete this metadata?")){
			var splitArray = event.target.id.split(":###:");
			var senderObject = new Object();
			senderObject.url = splitArray[1];
			senderObject.username = splitArray[2];
			self.port.emit("DELETE_PWD_DATA",senderObject);
		}
	});
	
});

self.port.on("DELETE_PWDS_FAIL_RESULT", function(returnString){
	alert("ERROR! " + returnString.split(":####:")[1]);
});

self.port.on("REGENERATE_PWD_FROM_DATA_RESULT", function(returnString){
	if (returnString.startsWith("OK")){
		alert("Password Is Coppied To Clipboard!");
	}
	else {
		alert("ERROR : " + returnString.split(":###:")[1]);
	}
});
self.port.on("SAVE_TO_PASSWORDSAFE_RESULT", function(returnString){
	if (returnString.startsWith("OK")){
		alert("Successfully Saved!");
		var splitArray = returnString.split(":###:");
		$('input[id="saveToPasswordSafe:###:' + splitArray[1] +':###:' + splitArray[2] +'"]').prop("disabled", true);
	}
	else{
		alert("ERROR : " + returnString.split(":###:")[1]);
	}
});


