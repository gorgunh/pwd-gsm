const specialCharactersASCIICodes = [33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,
									 58,59,60,61,62,63,64,
									 91,92,93,94,95,96,
									 123,124,125,126];

function getRootURLFromFullTabURL(tabUrl){
	var hostname = "";
	
	if (tabUrl.indexOf("://") > -1){
		hostname = tabUrl.split('/')[2];
	}
	else{
		hostname = tabUrl.split('/')[0];
	}
	
	hostname = hostname.split(':')[0];
	hostname = hostname.split('?')[0];
	
	hostNameSplit = hostname.split('.');
	if (hostNameSplit.length > 2){
		hostname = hostNameSplit[hostNameSplit.length - 2] + '.' + hostNameSplit[hostNameSplit.length - 1];
		if (hostNameSplit[hostNameSplit.length - 2].length == 2 && hostNameSplit[hostNameSplit.length - 1].length == 2){
			hostname = hostNameSplit[hostNameSplit.length - 3] + '.' + hostname;
		}
	}
	
	return hostname;
}
function digitTotalsOfANumber(number){
	var digitTotal = 0;
	var index;
	var stringOfNumber = number.toString();
	for (index = 0; index < stringOfNumber.length; index++){
		digitTotal = digitTotal + parseInt(stringOfNumber[index]);
	}
	return digitTotal;
}
function eliminateSpecialCharactersAndReplaceThemToDesiredCharacters(passwordString){
	var index;
	var returnString = "";
	for (index = 0; index < passwordString.length; index++){
		var characterCodeOfIndex = passwordString[index].charCodeAt(0);
		if (specialCharactersASCIICodes.includes(characterCodeOfIndex)){
			do{
				var digitTotalsOfASCIICode = digitTotalsOfANumber(characterCodeOfIndex);
				characterCodeOfIndex += digitTotalsOfASCIICode;
				if (characterCodeOfIndex >= 127){
					characterCodeOfIndex = characterCodeOfIndex % 127;
					if (characterCodeOfIndex <= 32){
						characterCodeOfIndex = characterCodeOfIndex + 33;
					}
				}
				else if (characterCodeOfIndex <= 32){
					characterCodeOfIndex = characterCodeOfIndex + 33;
				}
			} while(specialCharactersASCIICodes.includes(characterCodeOfIndex));
		}
		returnString += String.fromCharCode(characterCodeOfIndex);
	}
	return returnString;
}
function wordArrayToStringWithoutExtendedASCIICharacters(wordArray){
	var UTF8Word = "";
	var len = wordArray.words.length;
	var	u8_array = new Uint8Array(len << 2);
	var offset = 0, word, i;
	for (i=0; i<len; i++) {
		word = wordArray.words[i];
		u8_array[offset++] = word >> 24;
		u8_array[offset++] = (word >> 16) & 0xff;
		u8_array[offset++] = (word >> 8) & 0xff;
		u8_array[offset++] = word & 0xff;
	}
	
	
	u8_array.forEach(function(element,index,array){
		var decidedASCIICode;
		if (element >= 127){
			decidedASCIICode = element % 127;
			if (decidedASCIICode <= 32){
				decidedASCIICode = decidedASCIICode + 33;
			}
		}
		else if (element <= 32){
			decidedASCIICode = element + 33;
		}
		else{
			decidedASCIICode = element;
		}
		UTF8Word += String.fromCharCode(decidedASCIICode);
	});
	
	return UTF8Word;
}

module.exports.utils = {
	getRootURLFromFullTabURL : getRootURLFromFullTabURL,
	wordArrayToStringWithoutExtendedASCIICharacters : wordArrayToStringWithoutExtendedASCIICharacters,
	eliminateSpecialCharactersAndReplaceThemToDesiredCharacters : eliminateSpecialCharactersAndReplaceThemToDesiredCharacters
}
