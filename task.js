//Описание задачи и ее свойств, проверка их корректности про добавлении и редактировании
var db 		= require('./modules/db'),
	Promise = require('bluebird'),
	async 	= require('async');
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

	this.description = null;										//description
	this.reminder = null;											//напоминание, дата когда напомнить
	//this.taskList = null;											//список задач, которым принадлежит данная: Работа, Семья, Дом, ...
	this.repeat = null;												//когда повторять, например задача отправить ЗП на определенное число месяца
}	

myTask.prototype.checkType = function(){							//проверка правильности родителя у заданного типа задачи, расширить еще
	var self = this;
	return new Promise(function(resolve, reject){
		if(self.type == typeArray[2] && self.parent == null){			//Если подзадача, то должен быть родитель
			console.log('У подзадачи должен быть родитель. Задача: ' + self.name);
			reject(false);
		}
		else
			resolve(true);
	}).then(function(){
		console.log('3');
		return true;
	}, function(){
		return false;	
	});
}

myTask.prototype.checkParent = function(){								//Если есть родитель, то он должен быть из списка задач
	var self = this;
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
		console.log('Ошибка при загрузке списка задач из БД' + err);
	});
}

myTask.prototype.checkUser = function(){								//Если есть постановщик, то он должен быть из списка пользователей, такие же проверки для всех пользователей
	var self = this;
	return new Promise(function(resolve, reject){
		db.loadAllUsers(function(err, res){
			if(err)
				reject(err);
			else
				resolve(res);
		})
	}).then(function(res){
		for(var i = 0; i < res.length; i++){
			//console.log(self.director + ' ' + res[i].name);
			if(self.director == res[i].name){
				console.log('2');
				return true;
				break;
			}															//Прошел по массиву не нашел родительской задачи в списке
		}
		return false;
	}, function(err){
		console.log('Ошибка при загрузке списка пользователей из БД' + err);
	});
}

myTask.prototype.checkThis = function(cb){							//тут собрать вместе все проверки на дату, на родителя, и пускать задачу дальше только если все ок
	Promise.all([this.checkParent(), this.checkUser(), this.checkType()]).then(function(resultArray){
		console.log(resultArray);
		for(var i = 0; i < resultArray.length; i++){
			if(resultArray[i] == false){
				var err = 'Check this find error';
				//console.log(err);
				cb(err);
				break;
			}
			else if(i == (resultArray.length-1)) {
				console.log('4');
				cb(null, true);
			}
		}
	})
}

myTask.prototype.init = function(obj, cb){								//заполняю задачу из объекта для дальнейшей проверки
	for(var i in obj){
		this[i] = obj[i];
	}
	this.checkThis(function(err, result){
		if(err) {
			cb(err);
			console.log(err);
		}
		else
			cb(null, true);
	});
}

module.exports = myTask;