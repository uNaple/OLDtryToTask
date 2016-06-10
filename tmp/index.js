

//=========================================================================ROUTE
//я мудак. адреса в нижнем регистре, имена функция по верблюжьи
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
app.post('/showsubtask', showSubTask);
app.post('/adduser', addUser);			//Добавление пользователя


var taskList = new Array(),											//Список заданий
	userList = new Array();											//Список пользователей

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

	this.description = null;										//description

	this.reminder = null;											//напоминание, дата когда напомнить
	//this.taskList = null;											//список задач, которым принадлежит данная: Работа, Семья, Дом, ...
	this.repeat = null;												//когда повторять, например задача отправить ЗП на определенное число месяца
}

//==========================================================================HANDLER
function home(req,res) {
	res.render('index',{
				title: 'TASK MANAGER YOPTA'})
}

function edit(req,res){
	res.render('edit', {
				title: 			'TASK MANAGER YOPTA',
				task: 			JSON.parse(req.body.task),
				typeArray: 		typeArray,
				usersArray: 	userList,
				statusArray: 	statusArray,
				taskArray: 		taskList
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
	}
}

function add(req,res){
	res.render('add', {
		title: 			'TASK MANAGER YOPTA',
		task: 			new myTask(),
		typeArray: 		typeArray,
		usersArray: 	userList,
		statusArray: 	statusArray,
		taskArray: 		taskList
	})
}

function addTask(req,res){
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

function show(req,res){
	db.loadTask(req.body.id || req.params.id || req.query.id, function(err, tmpTask){
		if(err){
			console.log(err.message);
			res.render('index', {
							error: err.message})
		}
		else {
			res.render('show', {
				title: 		'TASK MANAGER YOPTA',
				tmpTask: 	tmpTask

			})
		}
	})	
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

function showSubTask(req,res){
	db.loadSubTask(JSON.parse(req.body.task).parent, function(err, result){
		//console.log(result);
		if(err) {						//если нет подзадач рисовать сообщение об этом на странице
			console.log(err);
			//alert('No sub tasks');
			res.send('Errorrsa123');
		}
		else {
			res.render('showall', {
	 			title:  'TASK MANAGER YOPTA',
				rows:  	result
			})
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

//====================================
module.exports = {
	home : 			home,
	edit: 			edit,
	update: 		update,
	add: 			add,
	addTask: 		addTask,
	show: 			show,
	showUsers: 		showUsers,
	showAll: 		showAll,
	showSubTask: 	showSubTask,
	addUser: 		addUser
}