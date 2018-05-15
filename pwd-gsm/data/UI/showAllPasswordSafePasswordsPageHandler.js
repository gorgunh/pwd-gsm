var tableDOMString = "";
$('#all_passwordsafe_passwords_table').html(tableDOMString);
self.port.on("SHOW_ALL_PASSWORDSAFE_PWDS_RESULT", function(returnArray){
	//console.log(returnArray);
	if(returnArray.returnStatus == "OK"){
		$.each(returnArray.returnData, function(index,value){
			tableDOMString += "<tr>"
							+	"<td width = '400px'>" + value.title + "</td>"
							+	"<td width = '200px'>" + value.username + "</td>"
							+	"<td width = '200px'><input type='button' value = 'Copy To Clipboard' id = 'copyClipboard:###:" + value.password + "'></td>";
							+ "</tr>";
		});
		$('#all_passwordsafe_passwords_table').html(tableDOMString);
		$('input[id^="copyClipboard"]').click(function(event){
			var splitArray = event.target.id.split(":###:");
			self.port.emit("COPY_TO_CLIPBOARD_FROM_PASSWORDSAFE",splitArray[1]);
			alert("Password Coppied To Clipboard!");
		});
	}
	else{
		alert("ERROR - " + returnArray.returnData);
	}
});
