function connectDB(cb) { 						//коннект к ДБ
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

// myTask.prototype.addTask = 
function addTask (obj, cb) {						//добавить задание 
	obj.status = statusArray[3];				//Автоматически выставляется при добавлении
  // try {
	connectDB( function (client) {
		// if(obj.name == client.query(`SELECT * FROM tasks.tasks WHERE name = '${obj.name}';`, function(err, result){

		// }))
		var text = 'sometext';
		obj.timeOfSet = getNowDate();
		var queryHead = `INSERT INTO tasks.tasks(Заголовок, Постановщик, Контроллер, Время_постановки, Статус`,
			queryTail = `VALUES('${obj.Имя}', 
								'${obj.Постановщик}',
								'${obj.Контроллер}',
								'${obj.timeOfSet}',
								'${obj.Статус}'`;
		if(obj.Тип != null) {
			queryHead += ', Тип';
			queryTail += `, '${obj.Тип}'`;
		}
		if(obj.Исполнитель != null) {
			queryHead += ', Исполнитель';
			queryTail += `, '${obj.Исполнитель}'`;
		}
		if(obj.Описание != null) {
			queryHead += ', Описание';
			queryTail += `, '${obj.Описание}'`;
		}
		queryHead += ')';
		queryTail += ')';
		var queryFinal = queryHead + queryTail + ' RETURNING id;';
		client.query(queryFinal, function(err, result) {
			    if (err) 
			    	cb(err)
			    else { 
			    	console.log('Задача добавлена с id: ' + result.rows[0].id);
			    	obj.id = result.rows[0].id;
			    	cb(null, obj);
			    }
		addHistory(client,"blahblah",typeOfAction[0]);	    
		client.end();
			});
	});
  // } 
  // catch 
  // 	return;
 }

function updateTask (obj, cb){                      //обновить задание
	connectDB(function(client) {
		var query = `UPDATE tasks.tasks	SET `;      //создаем строку запроса
		if(obj.Заголовок != null) {
			query += `Заголовок = '${obj.Заголовок}'`;
		}
		if(obj.Тип != null) {
			query += `, Тип = '${obj.Тип}'`;
		}
		if(obj.Описание != null) {
			query += `, Описание = '${obj.Описание}'`;
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

function loadAll(tmpTask){							//принимает переменную, в которую посылает полученные из БД данные
	connectDB( function(client){
		var query = `SELECT * FROM tasks.tasks;`;
		client.query(query, function (err, result){
			if(err)
				tmpTask(err);
			else 
				tmpTask(null, result.rows);
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
				// console.log(result.rows[0]);
			client.end();
		})
	})
}

function reassignTask(recieve, give) {			//Переназначить задание
	//кто получает от кого получает
	//меняем статус на ожидание, создаем новую задачу, в истории отмечаем что переназначили
	connectDB(function(client){
		client.query (`UPDATE tasks.tasks 
			SET Исполнитель = '${recieve}', 
				Статус = '${statusArray[4]}'
			WHERE Исполнитель = '${give}'`, 
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
			Заголовок varchar(30),
			Тип varchar(30),
			Постановщик varchar(30),
			Контроллер varchar(20),
			Исполнитель varchar(20),
			Время_постановки timestamp without time zone,
			Время_начала timestamp without time zone,
			Время_окончания timestamp without time zone, 
			Статус varchar(40), 
			Родитель varchar(20),
			Описание varchar(300));`         //PRIMARY KEY (id) через запятую можно указать несколько первичных ключей
		break
	case 'users':
		var query = `CREATE TABLE tasks.users	(
			id SERIAL,
			Имя varchar(40));`
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

function deleteTable(name) {              		//удаление
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
	var today = objToday.getFullYear() + '-' + objToday.getMonth() + '-' +  objToday.getDate() + ' ' +  curHour + ":" + curMinute + ":" + curSeconds;
	return today;                       //текущая дата в формате timestamp without time zone
}

function addHistory(client, text, action){      //добавить в таблицу истории
	client.query(`INSERT INTO tasks.history(Текст, Действие, Время)
	VALUES('${text}',
		   '${action}',
		   '${getNowDate()}');`, function(err, res){
		   	if(err)
		   		console.log('Ошибка при добавлении в историю' + err);
		   	else
		   		console.log('Запись успешно добавлена в таблицу действий');
	client.end();
	});
}

var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "Статус сменен на *", "Обновлено"],
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

};