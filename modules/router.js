var db 			= require('./db'),
	path		= require('path'),
	bodyParser 	= require('body-parser'),
	async 		= require('async'),
	auth		= require('./auth');

var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "Статус сменен на *"],
	typeArray    = ['Проект','Задача','Подзадача'];

function myTask() {           										//объект Задание
	this.id = null;
	this.name = 'New Task';											//name

	this.type = null;												//type задачи: задача, подзадача, проект
	this.director = 'insystem';										//director

	this.controller = 'insystem';									//controllerом изначально ставится директор	
	this.executor = null;											//executor

	this.timeOfSet = db.getNowDate();								//Время установки
	this.timeOfStart = null;										//Время начала
	this.timeOfEnd = null;											//Время конца
	
	this.status = null;												//status задачи
	this.parent = null;												//родитель, если задача принадлежит проекту или является подзадачей
	this.child	= null;												//набор подзадач, для этого проекта

	this.description = null;										//description

	this.reminder = null;											//напоминание, дата когда напомнить
	//this.taskList = null;											//список задач, которым принадлежит данная: Работа, Семья, Дом, ...
	this.repeat = null;												//когда повторять, например задача отправить ЗП на определенное число месяца
}

module.exports = function(app, express){
	//================================================================MIDDLEWARE
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.raw());
	//app.use(db.getList(taskList, userList));
	//app.use('/edit', db.getList(taskList, userList));
	
	//================================================================ROUTE
	//я мудак, поэтому адреса в нижнем регистре, имена функций по верблюжьи
	app.get('/', home);
	//основные страницы
	app.get('/show', show);					//Отображение данных о задаче
	app.get('/add', add);					//Форма для добавления задания
	app.get('/showall', showAll);			//Отображение всех задач
	app.get('/showusers', showUsers);		//Отображение всех пользователей
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
				res.render('add', {
					title: 			'TASK MANAGER YOPTA',
					task: 			new myTask(),
					typeArray: 		typeArray,
					statusArray: 	statusArray,
					usersArray: 	userList,
					taskArray: 		taskList
				})
		});
	}

	function showAll(req,res){
		db.loadAll(function(err, result){    							//в переменной результаты запроса из БД
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
		db.getList(function(err, userList, taskList){
			if(err)
				console.log('Edit ' + err)
			else {
				console.log(JSON.parse(req.body.task));
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

	function update(req,res){
		db.updateTask(req.body,	function(err){
			if(err)
				console.log('Ошибка при обновлении: ' + err);
			else {
				console.log('Успешно обновлено!');      
				res.redirect('/showall');
			}
		})
	}

	function showSubTask(req,res){
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

	function addTask(req, res){													//Обработка добавления задания
		console.log(req.body);
		db.addTask(req.body, function(err, result){
			if(err)
				console.log(err);
			else {
				console.log(result);
				res.redirect('/show?id='+result.id);
			}
		})
	}

	function addUser(req,res){
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