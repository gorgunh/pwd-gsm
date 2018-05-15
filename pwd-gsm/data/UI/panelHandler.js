var currentURL = "";

addon.port.on("MAIN_MENU_REDIRECT", function (returnMessage){
	currentURL = returnMessage;
	$('#set_first_master_password_first_div').hide();
	$('#login_div').hide();
	$('#generate_password_div').hide();
	$('#password_safe_integration_menu_div').hide();
	$('#passwordsafe_integration_config_div').hide();
	
	if (currentURL.startsWith("about") || currentURL.startsWith("resource")){
		$('#generate_password_for_specific_site').val('Generate Password For This Site');
		$('#generate_password_for_specific_site').attr('disabled',true);
	}
	else{
		$('#generate_password_for_specific_site').val('Generate Password For ' + currentURL);
		$('#generate_password_for_specific_site').attr('disabled',false);
	}
	
	$('#main_menu_div').show();
	
});

$('#passwordsafe_integration_menu_btn').click(function(){
	$('#login_div').hide();
	$('#main_menu_div').hide();
	$('#set_first_master_password_first_div').hide();
	$('#generate_password_div').hide();
	$('#passwordsafe_integration_config_div').hide();
	$('#password_safe_integration_menu_div').show();
	
});

$('#passwordsafe_integration_config_btn').click(function(){
	addon.port.emit("PASSWORDSAFE_CONFG");
});

addon.port.on("PASSWORDSAFE_CONFG_RESULT", function(returnObject){
	$('#passwordsafe_database_file_path').val('');
	$('#passwordsafe_database_password').val('');
	
	if (returnObject.psafe3DatabasePath != null){
		$('#passwordsafe_database_file_path').val(returnObject.psafe3DatabasePath);
	}
	if (returnObject.DBPassword != null){
		$('#passwordsafe_database_password').val(returnObject.DBPassword);
	}
	$('#login_div').hide();
	$('#main_menu_div').hide();
	$('#set_first_master_password_first_div').hide();
	$('#generate_password_div').hide();
	$('#password_safe_integration_menu_div').hide();
	$('#passwordsafe_integration_config_div').show();
	
	$('#passwordsafe_configuration_save_error_message_div').html('');
	$('#passwordsafe_configuration_save_error_message_div').hide();
	
});

$('#passwordsafe_list_all_btn').click(function(){
	addon.port.emit('SHOW_ALL_PASSWORDSAFE_PWDS');
});

$('#save_passwordsafe_config_btn').click(function(){
	if ($('#passwordsafe_database_file_path').val() == '' || $('#passwordsafe_database_password').val() == ''){
		$('#passwordsafe_configuration_save_error_message_div').html('<font color = "red">File Path or Password should not be empty!</font>');
		$('#passwordsafe_configuration_save_error_message_div').show();
	}
	else{
		var objectToSave = new Object();
		objectToSave.psafe3DatabasePath = $('#passwordsafe_database_file_path').val();
		objectToSave.DBPassword = $('#passwordsafe_database_password').val();
		addon.port.emit('PASSWORDSAVE_CONFG_SAVE', objectToSave);
	}
});

addon.port.on("PASSWORDSAVE_CONF_SAVE_RESULT", function(returnMessage){
	if(returnMessage.startsWith("OK")){
		$('#passwordsafe_configuration_save_error_message_div').html('<font color = "green">Saved Successfully!</font>');
	}
	else{
		$('#passwordsafe_configuration_save_error_message_div').html('<font color = "red">' + returnMessage.split(":###:")[1] + '</font>');
	}
	$('#passwordsafe_configuration_save_error_message_div').show();
});

$('#generate_password_for_specific_site').click(function(){
	$('#login_div').hide();
	$('#main_menu_div').hide();
	$('#set_first_master_password_first_div').hide();
	$('#password_safe_integration_menu_div').hide();
	$('#passwordsafe_integration_config_div').hide();
	$('#generate_password_div').show();
	
	$('#username_for_generate_password').val('');
	$('#desired_length_for_generate_password').val('');
	$('#upper_case_allowed_checkbox').prop('checked',true);
	$('#special_characters_allowed_checkbox').prop('checked',true);
	
	$('#generate_password_error_message_div').html('');
	$('#generate_password_error_message_div').hide();
});

$('#generate_and_save_password_btn').click(function(){
	if ($('#username_for_generate_password').val() == ""){
		$('#generate_password_error_message_div').html('<font color = "red">Please enter the username!</font>');
		$('#generate_password_error_message_div').show();
		return;
	}
	var generateNewPasswordMetadataObject = new Object();
	generateNewPasswordMetadataObject.url = currentURL;
	generateNewPasswordMetadataObject.username = $('#username_for_generate_password').val();
	generateNewPasswordMetadataObject.passwordLength = $('#desired_length_for_generate_password').val();
	if($('#upper_case_allowed_checkbox').is(':checked')){
		generateNewPasswordMetadataObject.isUpperCaseAllowed = true;
	}
	else{
		generateNewPasswordMetadataObject.isUpperCaseAllowed = false;
	}
	if($('#special_characters_allowed_checkbox').is(':checked')){
		generateNewPasswordMetadataObject.isSpecialCharactersAllowed = true;
	}
	else{
		generateNewPasswordMetadataObject.isSpecialCharactersAllowed = false;
	}
	addon.port.emit("GENERATE_SAVE_CCB_PWD", generateNewPasswordMetadataObject);
});

addon.port.on("GENERATE_SAVE_CCB_PWD_RESULT", function(returnMessage){
	if(returnMessage.startsWith("OK")){
		$('#generate_password_error_message_div').html('<font color = "green">Password Created Successfully, Coppied into Clipboard!</font>');
		$('#generate_password_error_message_div').show();
	}
	else{
		$('#generate_password_error_message_div').html('<font color = "red">' + returnMessage.split(":###:")[1] + "</font>");
		$('#generate_password_error_message_div').show();
	}
});

addon.port.on("LOGIN_PAGE_REDIRECT",function(){
	$('#set_first_master_password_first_div').hide();
	$('#main_menu_div').hide();
	$('#generate_password_div').hide();
	$('#password_safe_integration_menu_div').hide();
	$('#passwordsafe_integration_config_div').hide();
	$('#login_div').show();
	
	$('#master_password_for_login').val('');
	$('#login_error_message_div').html('');
	$('#login_error_message_div').hide();
});

$('#login_btn').click(function(){
	var passwordForLogin = $('#master_password_for_login').val();
	if (passwordForLogin != ""){
		addon.port.emit("LOGIN", passwordForLogin);
	}
	else{
		$('#login_error_message_div').html('<font color = "red">Please enter your password!</font>');
		$('#login_error_message_div').show();
	}
});

addon.port.on("LOGIN_FAILED", function(returnMessage){
	$('#login_error_message_div').html('<font color = "red">' + returnMessage + '</font>');
	$('#login_error_message_div').show();
});

addon.port.on("MASTER_PWD_DECISION_REDIRECT",function(){
	$('#login_div').hide();
	$('#main_menu_div').hide();
	$('#generate_password_div').hide();
	$('#password_safe_integration_menu_div').hide();
	$('#passwordsafe_integration_config_div').hide();
	$('#set_first_master_password_first_div').show();
	
	$('#set_master_password_first_error_message_div').html('');
	$('#set_master_password_first_error_message_div').hide();
	
	$('#first_master_password').val('');
	$('#first_master_password_re_enter').val('');
});

$('#set_first_master_password_btn').click(function(){
	if ($('#first_master_password').val() == "" || $('#first_master_password_re_enter').val() == ""){
		$('#set_master_password_first_error_message_div').html('<font color = "red">Master Password or Re-Enter Master Password Fields Cannot Be Empty!</font>');
		$('#set_master_password_first_error_message_div').show();
		return;
	}
	if ($('#first_master_password').val() != $('#first_master_password_re_enter').val()){
		$('#set_master_password_first_error_message_div').html('<font color = "red">They are not equal!</font>');
		$('#set_master_password_first_error_message_div').show();
		return;
	}
	else{
		addon.port.emit("INIT_MP", $('#first_master_password').val());
	}
});

$('#list_all_passwords_btn').click(function(){
	addon.port.emit("SHOW_ALL_PWDS");
});
