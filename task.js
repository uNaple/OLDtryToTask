//Описание задачи и ее свойств, проверка их корректности про добавлении и редактировании
var db = require('./modules/db');
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

myTask.prototype.checkParent = function(){							//проверка правильности родителя
	var self = this;
	//console.log(self.type);
	//console.log(self.parent);
	if(self.type == typeArray[2] && self.parent == null){
		console.log('У подзадачи должен быть родитель. Задача: ' + self.name);
		return null;
	}
	else 
		return true;
}

myTask.prototype.checkThis = function(){							//тут собрать вместе все проверки на дату, на родителя, и пускать задачу дальше только если все ок
	if(this.checkParent())
		return true;
	else {
		console.log('check this find error ');
		return null;
	}
}

myTask.prototype.init = function(obj){								//заполняю задачу из объекта
	for(var i in obj){
		this[i] = obj[i];
	}
	return this.checkThis();
}

module.exports = myTask;