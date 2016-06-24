//Описание задачи и ее свойств, проверка их корректности про добавлении и редактировании
var db 		= require('./modules/db'),
	Promise = require('bluebird');
var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "Статус сменен на *"],
	typeArray    = ['Проект','Задача','Подзадача'];

function myTask() {           										//объект Задание
	this.id = null;
	this.name = 'New Task';											//name

	this.type = null;												//type задачи: задача, подзадача, проект

	this.director = 'insystem';										//director
	this.controller =  null;										//controllerом изначально ставится директор	
	this.executor = null;											//executor

	this.timeOfSet = db.getNowDate();								//Время установки
	this.timeOfStart = null;										//Время начала
	this.timeOfEnd = null;											//Время конца
	
	this.status = null;												//status задачи
	
	this.parent = null;												//родитель, если задача принадлежит проекту или является подзадачей
	this.child	= [];												//набор подзадач, для этого проекта
	//this.isParent();
	//this.isChild();

	this.description = null;										//description
	this.reminder = null;											//напоминание, дата когда напомнить
	//this.taskList = null;											//список задач, которым принадлежит данная: Работа, Семья, Дом, ...
	this.repeat = null;												//когда повторять, например задача отправить ЗП на определенное число месяца

}	

myTask.prototype.checkType = function(){							//проверка правильности родителя у заданного типа задачи, расширить еще
	var self = this;
	if(self.type == typeArray[2] && self.parent == null){		//Если подзадача, то должен быть родитель
		console.log('У подзадачи должен быть родитель. Задача: ' + self.name);
		return false;
	}
	else 
		return true;
}

// myTask.prototype.chekOwners = function(){
// 	var self = this;
// 	return new Promise(function(resolve, reject){
// 		db.getList(function(err, userList, taskList){

// 		})
// 	})
// }

myTask.prototype.checkParent = function(){								//Если есть родитель, то он должен быть из списка задач
	var self = this,
		answer;
	return new Promise(function(resolve, reject){
		db.loadAll(function(err, res){
			if(err)
				reject(err);
			else
				resolve(res);
		})
	}).then(function(res){
		for(var i = 0; i < res.length; i++){
			//console.log(self.parent + ' ' + res[i].name);
			if(self.parent == res[i].name){
				console.log('1');
				return true;
				break;
			}															//Прошел по массиву не нашел родительской задачи в списке
		}
		return false;
	}, function(err){
		console.log('2 Ошибка при загрузке списка из БД' + err);
	})
}

myTask.prototype.checkThis = function(){							//тут собрать вместе все проверки на дату, на родителя, и пускать задачу дальше только если все ок
	var typeIsOk = checkType(),
		parentIsOk;
	this.checkParent().then(function(result){
		if(result) {
			console.log('6' + result);
			parentIsOk = true;
		}
		else {
			console.log('7' + result);
			parentIsOk = false;
		}
	});
	if(typeIsOk && parentIsOk){
		return true;
	}
	else {
		console.log('check this find error ');
		return null;
	}
}

myTask.prototype.init = function(obj){								//заполняю задачу из объекта для дальнейшей проверки
	for(var i in obj){
		this[i] = obj[i];
	}
	return this.checkThis();
}

module.exports = myTask;