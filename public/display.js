var db = require('../modules/db');

function checkParent(value){
	alert('imhere');
	if(value == 'Подзадача') {
		document.getElementById('idParent1').hidden = false;
		document.getElementById('idParent2').hidden = false;
	}
	else {
		document.getElementById('idParent1').hidden = true;
		document.getElementById('idParent2').hidden = true;
	}
}

function getTaskArr(){
	db.loadAll(function(err,result){
		if(err)
			console.log('Get list tasks: '+err);
		else {
			result.forEach(function(item,i,result){
				var taskList[i] = item.name;
			})
			//console.log(taskList);
			return taskList;
		}
	})
}
