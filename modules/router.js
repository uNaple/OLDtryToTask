//Роутинг и обработка 
var db 			= require('./db'),
	path		= require('path'),
	bodyParser 	= require('body-parser'),
	async 		= require('async'),
	auth		= require('./auth'),
	myTask 		= require('../task');

var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "Статус сменен на *"],
	typeArray    = ['Проект','Задача','Подзадача'];

module.exports = function(app, express){
	//================================================================MIDDLEWARE
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.raw());
	//================================================================ROUTE
	//я мудак, поэтому адреса в нижнем регистре, имена функций по верблюжьи
	app.get('/', home);
	//основные страницы
	app.get('/show', show);					//Отображение данных о задаче
	app.get('/add', add);					//Форма для добавления задания
	app.get('/showall', showAll);			//Отображение всех задач
	app.get('/showusers', showUsers);		//Отображение всех пользователей
	app.get('/deletetask', deleteTask);		//Удалить задачу
	app.get('/deleteuser', deleteUser);
	app.post('/edit', edit);				//Форма для редактирования задания

	//действия по нажатию кнопок. сделать норм обработку, чтоб не было отдельного адреса на действия
	app.post('/addtask', addTask);			//Обработка добавления задания
	app.post('/update', update);			//Обработка обновления задания
	app.post('/showsubtask', showSubTask);	//показать подзадачи
	app.post('/adduser', addUser);			//Добавление пользователя
	//================================================================HANDLER

	function home(req,res) {
		res.render('index',{
					title: 'TASK MANAGER YOPTA'})
	}
	
	function show(req,res){
		db.loadTask(req.body.id || req.params.id || req.query.id, function(err, tmpTask){
			if(err){
				console.log(err.message);
			}
			else {
				res.render('show', {
					title: 		'TASK MANAGER YOPTA',
					tmpTask: 	tmpTask
				})
			}
		})	
	}
	
	function add(req,res){
		db.getList(function(err, userList, taskList){
			if(err)
				console.log(err)
			else
				//console.log(taskList);
				res.render('add', {
					title: 			'TASK MANAGER YOPTA',
					task: 			new myTask,
					typeArray: 		typeArray,
					statusArray: 	statusArray,
					usersArray: 	userList,
					taskArray: 		taskList
				})
		});
	}

	function showAll(req,res){
		db.loadAll(function(err, result){    									//в переменной результаты запроса из БД
			if(err)
				console.log("LoadAll function " + err);
			else {
				res.render('showall', {
		 			title:  'TASK MANAGER YOPTA',
					rows:  	result
				})
			}
		})
	}

	function showUsers(req,res){
		db.loadAllUsers(function(err, rows){
			if(err)
				console.log("Load All users function " + err);
			else {
				res.render('showusers', {
		 			title:  'TASK MANAGER YOPTA',
					rows:  	rows
				})
			}
		})
	}

	function edit(req,res){
		//console.log(JSON.parse(req.body.task));
		db.getList(function(err, userList, taskList){
			if(err)
				console.log('Edit ' + err)
			else {
				res.render('edit', {
							title: 			'TASK MANAGER YOPTA',
							task: 			JSON.parse(req.body.task),
							typeArray: 		typeArray,
							userArray: 		userList,
							statusArray: 	statusArray,
							taskArray: 		taskList
				})
			}
		})
	}

	function addTask(req, res){													//Обработка добавления задания
		var obj = new myTask;
		//console.log(req.body);														//создаю экземпляр и проверяю на корректность данных и если все норм, то заношу
		obj.checkThis(req.body, function(err){
			if(err){
				res.send('Dont proshel proverky on correct');
				console.log('Не прошел проверку на корректность');
			}
			else {
				db.addTask(obj, function(err, result){
					if(err)
						console.log(err);
					else {
						console.log(result);
						res.redirect('/show?id='+result.id);
					}
				})
			}
		})
	}

	function update(req,res){													//проверяю на корректность данных после изменения и заношу в бд
		var obj = new myTask;
		obj.checkThis(req.body, function(err){
			if(err) {
				res.send('Dont proshel proverky on correct');
				console.log('Не прошел проверку на корректность');
			}
			else {
				db.updateTask(obj, function(err){
					if(err)
						console.log('Ошибка при обновлении: ' + err);
					else {
						console.log('Успешно обновлено!');      
						res.redirect('/showall');
					}
				})
			}
		})
	}

	function showSubTask(req, res){
		db.loadSubTask(JSON.parse(req.body.task).name, function(err, result){
			if(err) {															//если нет подзадач рисовать сообщение об этом на странице
				console.log(err);
				res.send('Have not subtasks');
			}
			else {
				res.render('showall', {
		 			title:  'TASK MANAGER YOPTA',
					rows:  	result
				})
			}
		})
	}

	function addUser(req, res){
		db.addUser(req.body.userName, function(err, result){
			if(err)
				console.log("Add user function " + err);
			else {
				console.log('Пользователь добавлен с id: ' + result.rows[0].id);
				res.redirect('/showusers');
			}
		});
		console.log(req.body.userName);
	}

	function deleteTask(req, res){
		// console.log(JSON.parse(req.query.task).name);
		// var obj = new myTask;
		// obj.checkChildren(JSON.parse(req.query.task).name, function(err, result){
		// 	if(err){
		// 		console.log('Ошибка при проверке детей ' + err);
		// 		res.send('Ошибка при проверке детей ' + err);//какая-то там ошибка из бд при проверке подзадач
		// 	}
		// 	else if(result){
		// 		res.send('Есть подзадачи и они тоже будут удалены');//ок или отмена для продолжения удаления или отмены удаления
		// 	}
		// 	else {
				db.deleteTask(JSON.parse(req.query.task).id, function(err, result){
					if(err)
						console.log('Ошибка при удалении задачи ' + err)
					else {
						console.log(result);
						//console.log('Задание с id = ' + `${id}` + ' удалено');
						res.redirect('/showall');
					}
				})	
		// 	}
		// });
	}

	function deleteUser(req, res){
		db.deleteUser(req.query.id, function(err, result){
			if(err)
				console.log('Ошибка при удалении пользователя ' + err);
			else {
				console.log(result);
				res.redirect('/showusers');
			}
		})
	}

}
//================================================================EXPORT
// module.exports = {
// 	home : 			home,
// 	edit: 			edit,
// 	update: 		update,
// 	add: 			add,
// 	addTask: 		addTask,
// 	show: 			show,
// 	showUsers: 		showUsers,
// 	showAll: 		showAll,
// 	showSubTask: 	showSubTask,
// 	addUser: 		addUser
// }