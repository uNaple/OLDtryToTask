var async = require('async');

function connectDB(cb) { 							//коннект к ДБ
	var pg = require('pg');
	var conString = "postgres://tasker:password@127.0.0.1:5432/tasks";//"tasks-postgres://tasker:password@127.0.0.1:5432/tasks"
	var client = new pg.Client(conString);
	//client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
	client.connect(function(err) {
		if(err) {
			console.error('could not connect to postgres', err);
			throw new Error('could not connect to postgres');
 		}
		cb(client);
	});					   	
}

function toListTask(){
	var taskList = new Array();
	loadAll(function(err,result){
		if(err)
			console.log(err);
		else {
			for(var i = 0; i < result.length; i++)
				taskList[i] = result[i].name;
			return (taskList);
			//console.log(taskList);
		}
	})
}

function toListUser(){
	loadAllUsers(function(err,result){
		var userListTmp = new Array();
		if(err)
			console.log(err);
		else {
			for(var i = 0; i < result.length; i++)
				userListTmp[i] = result[i].name;
			return userListTmp;
			//console.log(userListTmp + '    1232131');
		}
	})
}

function getList(cb){
	var userList = new Array(),
		taskList = new Array();
	loadAllUsers(function(err,result){
		var userListTmp = new Array();
		if(err)
			console.log(err);
		else {
			for(var i = 0; i < result.length; i++)
				userList[i] = result[i].name;
			loadAll(function(err,result){
				if(err)
					console.log(err);
				else {
					for(var i = 0; i < result.length; i++)
						taskList[i] = result[i].name;
					cb(null, userList, taskList);
				}
			})			
		}
	})
}

// function getList(cb){					//загрузка списка всех пользователей и списка задач для отображения в выпадающем списке
// 	console.log(toListUser(), toListTask())
// 	//cb(null, toListUser(), toListTask());
// }

function addTask (obj, cb) {						//добавить задание 
	obj.status = statusArray[3];					//Автоматически выставляется при добавлении
  // try {
	connectDB( function (client) {					//подключаемся и создаем запрос
		var text = 'sometext';
		var queryHead = `INSERT INTO tasks.tasks(name, director, controller, timeOfSet, status`,
			queryTail = `VALUES('${obj.name}', 
								'${obj.director}',
								'${obj.controller}',
								'${getNowDate()}',
								'${obj.status}'`;
		if(obj.type != null) {
			queryHead += ', type';
			queryTail += `, '${obj.type}'`;
		}
		if(obj.executor != null) {
			queryHead += ', executor';
			queryTail += `, '${obj.executor}'`;
		}
		if(obj.description != null) {
			queryHead += ', description';
			queryTail += `, '${obj.description}'`;
		}
		if(obj.parent != null) {
			queryHead += ', parent';
			queryTail += `, '${obj.parent}'`;
		}
		queryHead += ')';
		queryTail += ')';
		var queryFinal = queryHead + queryTail + ' RETURNING id;';
		client.query(queryFinal, function(err, result) {						//отправляем запрос
		    if (err)
		    	cb(err)
		    else { 
		    	console.log('Задача добавлена с id: ' + result.rows[0].id);
		    	// obj.id = result.rows[0].id;
		    	loadTask(result.rows[0].id, function(err,result){			//возвращаем добавленную задачу
		    		if(err)
		    			cb(err);
		    		else {
		    			cb(null,result);
						addHistory(client,"blahblah",typeOfAction[0]);	    //добавляем в историю
					}
		    	});
		    }
			client.end();
		});
	});
 }

function addUser(obj, cb) {														//добавить пользователя
	connectDB(function (client) {
		var query = `INSERT INTO tasks.users(name) 
					 VALUES ('${obj}') RETURNING id`;
		client.query(query, function(err, result) {
		    if (err)
		    	cb(err);
		    else
		    	cb(null, result)
		    // obj.id = result.rows[0].id;
			//addHistory(client,"blahblah",typeOfAction[0]);	    
			client.end();
		})
	})
}

function addHistory(client, text, action){      								//добавить в таблицу истории
	client.query(`INSERT INTO tasks.history(Текст, Действие, Время)
	VALUES('${text}',
		   '${action}',
		   '${getNowDate()}');`, function(err, res){
		   	if(err)
		   		console.log('Ошибка при добавлении в историю: ' + err);
		   	else
		   		console.log('Запись успешно добавлена в таблицу действий');
	client.end();
	});
}

function updateTask (obj, cb){                      							//обновить задание
	connectDB(function(client) {
		var query = `UPDATE tasks.tasks	SET `;      							//создаем строку запроса
		if(obj.name != null) {
			query += `name = '${obj.name}'`;
		}
		if(obj.type != null) {
			query += `, type = '${obj.type}'`;
		}
		if(obj.description != null) {
			query += `, description = '${obj.description}'`;
		}
		if(obj.controller != null) {
			query += `, controller = '${obj.controller}'`;
		}
		if(obj.executor != null) {
			query += `, executor = '${obj.executor}'`;
		}
		if(obj.status != null) {
			query += `, status = '${obj.status}'`;
		}
		if(obj.parent != null) {
			query += `, parent = '${obj.parent}'`;
		}
		query += ` WHERE id = ${obj.id};`;
		//console.log(query);
		client.query(query, function(err, result) { //отправка запроса на обновление
			    if (err)
			    	cb(err);
			    else 
			    	cb(null)
			});
		addHistory(client,"бла",typeOfAction[3]); 	//добавляем в историю
		//client.end();
	})
}

function loadAllUsers(cb){							//Получтиь всех пользователей. Принимает переменную, в которую посылает полученные из БД данные
	connectDB( function(client){
		var query = `SELECT * FROM tasks.users;`;
		client.query(query, function (err, result){
			if(err)
				cb(err)
				//console.log('load All Users func. ' + err);
			else {
				//console.log(result.rows);
				cb(null, result.rows);
				//console.log('Данные из таблицы users получены');
				client.end();
			}
		})
	})
}

function loadAll(cb){							//Получить все задачи. Принимает переменную, в которую посылает полученные из БД данные
	connectDB(function(client){
		var query = `SELECT * FROM tasks.tasks;`;
		client.query(query, function (err, result){
			if(err)
				cb(err);
			else 
				cb(null, result.rows);
			client.end();
		})
	})

}

function loadTask(id, cb){							//передаю id и по нему получаю все данные о запрошенной задаче и вывожу в форму
	connectDB( function(client){
		var query = `SELECT * FROM tasks.tasks WHERE id = '${id}';`;
		client.query(query, function (err, result){
			if(err) {
				var err = new Error('Неверный формат ввода id');
				cb(err)
			}
			else if(result.rows[0] == undefined){
				var err = new Error('Нет задания с таким id');
				cb(err)
			}
			else 
				cb(null,result.rows[0]);
				//console.log(result.rows[0]);
			client.end();
		})
	})
}

function loadSubTask(parent, cb){										//передаю parent, сделать передачу по id родителя
	connectDB(function(client){						
		var query = `SELECT * FROM tasks.tasks WHERE parent='${parent}';`
		//console.log(query);
		client.query(query, function(err, result){
			//console.log(result);
			if(err){
				//var err = new Error('Load subtask error');
				cb(err)				
			}
			else if(result.rowCount == 0) {
				var err = new Error('Нет подзадач');
				cb(err);	
			}
			else {
				//console.log(result.rows);
				cb(null, result.rows);
			}
			client.end();
		})
	})
}

function reassignTask(recieve, give) {			//Переназначить задание
	//кто получает от кого получает
	//меняем status на ожидание, создаем новую задачу, в истории отмечаем что переназначили
	connectDB(function(client){
		client.query (`UPDATE tasks.tasks 
			SET executor = '${recieve}', 
				status = '${statusArray[4]}'
			WHERE executor = '${give}'`, 
		function(err, res){
			if(err)
				console.log('Ошибка при переназначении' + err);
			else { 
				console.log('Переназначили успешно!');
				addHistory(client, 'reassignTask', typeOfAction[1]);
			}
		});
	})
}

function createTable(name) {					//создать таблицу, поставить отлов ошибок
	connectDB ( function(client) {
	switch(name) {
	case 'tasks':
		var query = `CREATE TABLE tasks.tasks (
			id SERIAL,
			name varchar(30),
			type varchar(30),
			director varchar(30),
			controller varchar(20),
			executor varchar(20),
			timeOfSet timestamp without time zone,
			timeOfStart timestamp without time zone,
			timeOfEnd timestamp without time zone, 
			status varchar(40), 
			parent varchar(20),
			description varchar(300));`         //PRIMARY KEY (id) через запятую можно указать несколько первичных ключей
		break
	case 'users':
		var query = `CREATE TABLE tasks.users	(
			id SERIAL,
			name varchar(40));`
		break
	case 'history':	
		var query = `CREATE TABLE tasks.history (
			id SERIAL,
			Текст varchar(60),
			Действие varchar(50),
			Время timestamp without time zone);`
		break
	default:
		console.log('Нет совпадений с именем таблиц');
		var query = null;
	}
	if(query != null){
		client.query(query, function(err, res){
				if(err)
					console.log('Create table ' + err);
				else {
					console.log('Table ' + name + ' was created');
					client.end()
				}
			})
		}
	})
}

function deleteTable(name) {              		//удаление таблицы
	var query = `DELETE FROM tasks.${name};`;
	connectDB(function(client){
		client.query(query, function(err, result){
			if(err)
				console.log('Ошибка при удалении ' + err)
			else
				console.log('Успешно удалено!');
			client.end();
		})
	})
}

function getNowDate(){
	var objToday = new Date(),
       	curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours()),
       	curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes(),
       	curSeconds = objToday.getSeconds() < 10 ? "0" + objToday.getSeconds() : objToday.getSeconds();
	var today = objToday.getFullYear() + '-' + (objToday.getMonth()+1) + '-' +  objToday.getDate() + ' ' +  curHour + ":" + curMinute + ":" + curSeconds;
	return today;                       //текущая дата в формате timestamp without time zone
}

var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "status сменен на *", "Обновлено"],
	usersArray   = ["Саша", "Андрей", "Костя"],
	typeArray    = ['Проект','Задача','Подзадача'];
var name = 'lol',
	status = statusArray[3],//Автоматически выставляется при добавлении
	parent = '0';

module.exports = {
	connectDB:  	connectDB,
	addTask:    	addTask,
	updateTask: 	updateTask,
	loadTask:   	loadTask,
	loadAll: 		loadAll,
	createTable: 	createTable,
	addHistory: 	addHistory,
	getNowDate: 	getNowDate,
	deleteTable: 	deleteTable,
	reassignTask: 	reassignTask,
	addUser:     	addUser,
	loadAllUsers: 	loadAllUsers,
	getList: 		getList,
	loadSubTask: 	loadSubTask,
	// toListTask: 	toListTask,
	// toListUser: 	toListUser 
};