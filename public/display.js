var db = require('../modules/db');

function checkParent(value){
	//alert('hui');
	if(value == 'Подзадача') {
		document.getElementById('idParent1').hidden = false;
		document.getElementById('idParent2').hidden = false;
		console.log(1);
	}
	else {
		document.getElementById('idParent1').hidden = true;
		document.getElementById('idParent2').hidden = true;
		console.log(2);
	}
}

function checkChildren(){
	if(confirm('ds'))
		submit();
	else
		alert('hui');
}
// 	db.loadSubTask(name, function(err, result){
// 		if(err){
// 			console.log(err);
// 			alert('hui1u');
// 		}
// 		else if(result){
// 			if(confirm('У данной задачи есть подзадачи')){
// 				console.log(result);
// 				f.submit();
// 			}
// 		}
// 		else {
// 			if(confirm('Уверены, что хотите удалить задачу?')){
// 				f.submit();
// 			}
// 		}
// 	}
// }
