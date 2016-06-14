var db = require('../modules/db');

function checkParent(value){
	// /alert('imhere');
	if(value == 'Подзадача') {
		document.getElementById('idParent1').hidden = false;
		document.getElementById('idParent2').hidden = false;
	}
	else {
		document.getElementById('idParent1').hidden = true;
		document.getElementById('idParent2').hidden = true;
	}
}

// function getList(){
// 	db.getList(function(err, userList, taskList){
// 		if(err)
// 			console.log('display get list: ')
// 		else {
// 			var userList = userList,
// 				taskList = taskList;
// 			console.log(userList + taskList);
// 		}
// 	})	
// }

// function getUserList(){
// 	var userList = [1,2,3];
// 	return userList;
// }

// function getTaskList(){
// 	var taskList = [4,6,5];
// 	return taskList
// }