"use strict";
// var task = {
// 	name : "task1",
// 	director : "director",//director

// 	controller : "controller",//controller
	
// 	executor : "executor",//executor


// 	timeOfSet : Date(),//Время установки
// 	timeOfStart : Date(),//время начала
// 	timeOfEnd : Date(),//время конца
	
// 	status : "В процессе",//status задачи
// 	parent : "insystem"//родитель

// }

var db 			= require('./db');
var express 	= require('express');
var app 		= express();
var path		= require('path');
var bodyParser 	= require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static(path.join(__dirname,'public')));

function myTask() {           				//объект Задание
	this.id = null;
	this.name = 'New Task';//name

	this.type = null;//type задачи: задача, подзадача, проект
	this.director = 'insystem';//director

	this.controller = 'insystem';//controllerом изначально ставится директор	
	this.executor = null;//executor


	this.timeOfSet = db.getNowDate();//Время установки
	this.timeOfStart = null;//Время начала
	this.timeOfEnd = null;//Время конца
	
	this.status = null;//status задачи
	this.parent = null;//родитель, если задача принадлежит проекту или является подзадачей

	this.description = null;//description

	this.reminder = null;//напоминание, дата когда напомнить
	this.taskList = null;//список задач, которым принадлежит данная: Работа, Семья, Дом, ...
	this.repeat = null;//когда повторять, например задача отправить ЗП на определенное число месяца
}

function getRandom(low,high){
	return Math.floor(Math.random() * (high - low) + low);
}

function randomFill(num){					//Рандомное заполнение
	for(var i = 0; i < num; i++) {
		var taskTMP = new myTask();
		taskTMP.name = 'RandomName ' + i;
		taskTMP.status =  statusArray[getRandom(0,3)]; 
		taskTMP.director = usersArray[getRandom(0,3)],
		taskTMP.controller = usersArray[getRandom(0,3)],
		taskTMP.executor = usersArray[getRandom(0,3)];
		taskTMP.timeOfSet = db.getNowDate();
		db.addTask(taskTMP);
	}
}

function userFill() {
	for(var i = 0; i < usersArray.length; i++)
		db.addUser(usersArray[i]);
}

function printInfo(){
	console.log('=============================')
	db.connectDB(function (client){
		var query = client.query("SELECT * FROM tasks.tasks;");
		query.on('row', function(err, row){
			if(err) {
				//console.log(err); 
			}	
			//console.log(' ');
			client.end();
		})
	});
}
//основные для работы
var statusArray  = ["В процессе", "Закончена", "Приостановлена", "Добавлена/Ожидает принятия", "Ожидает завершения подзадачи", "Отменена"],
	typeOfAction = ["Добавлена", "Переназначена", "Статус сменен на *"],
	usersArray   = ["Саша", "Андрей", "Костя"],
	typeArray    = ['Проект','Задача','Подзадача'];

//для переназначения
// var recieve = 'Леша',
// 	give = 'Саша';
//db.createTable('history');
//db.createTable('users');
//db.createTable('tasks');
//db.createTable('TEST NULL TABLE');
//db.deleteTable('tasks');
//db.reassignTask(recieve,give);	
//db.loadTask(process.argv[2]);
//db.addTask(task1);
//randomFill(2);
//userFill();
//======================================================================================================================

app.get('/', function(req, res){
	res.render('index',{
				title: 'TASK MANAGER YOPTA'})
})
												//Редактирование задания
app.post('/edit', function(req,res){
	db.loadAllUsers(function(err, result){
		if(err)
			console.log('Load all users func.' + err);
		else {
			res.render('edit', {
						title: 			'TASK MANAGER YOPTA',
						task: 			JSON.parse(req.body.task),
						typeArray: 		typeArray,
						usersArray: 	result,
						statusArray: 	statusArray
			})
		}
	})
})

app.post('/update', function(req,res){
	console.log(req.body);
	db.updateTask(req.body,	function(err){
		if(err)
			console.log('Ошибка при обновлении: ' + err);
		else {
			console.log('Успешно обновлено!');      
			res.redirect('/showall')
		}
	});
})
												//Добавление задания
app.get('/add', function(req,res){
	db.loadAllUsers(function(err, result){
		var task = new myTask();
		if(err)
			console.log('Load all users func.' + err);
		else {
			res.render('add', {
				title: 'TASK MANAGER YOPTA',
				task: task,
				typeArray: typeArray,
				usersArray: result
			})
		}
	})
})

app.post('/addTask', function(req, res){
	console.log(req.body);
	db.addTask(req.body, function(err, result){
		if(err)
			console.log(err);
		else {
			console.log(result);
			res.render('show', {
				title: 		'TASK MANAGER YOPTA',
				tmpTask: 	result
			})
		}
	})
})

app.post('/addUser', function(req,res){
	db.addUser(req.body.userName, function(err, result){
		if(err)
			console.log("Add user function " + err);
		else {
			console.log('Пользователь добавлен с id: ' + result.rows[0].id);
			res.redirect('/showusers');
		}
	});    				//в переменной результаты запроса из БД
	console.log(req.body.userName);
})

app.get('/showusers', function(req,res){
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
})

app.get('/test', function(req, res){
	res.render('test', {
		title : 'test'
	});
})

app.post('/show', function (req, res) {
	// console.log('input id: ' + req.body.id || req.params.id || req.query.id);
	//console.log(req.body.id);
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
});

app.get('/showall', function (req, res) {
	db.loadAll(function(err, tmpTask){    				//в переменной результаты запроса из БД
		if(err)
			console.log("LoadAll function " + err);
		else {
			res.render('showall', {
	 			title:  'TASK MANAGER YOPTA',
				rows:  	tmpTask})
			}
		})
	}
);

// app.post('/', function(req,res,next){
// 	task2.name = req.body.title;
// 	console.log(req.body.title + " " + req.body.data);
// })

app.use(function(req, res, next) {
    res.status(404).render("error", {
        title: "404",
        msg: "ошибка 404"
    });
    // res.status(500).render("error", {
    //     title: "ошибка 500",
    //     msg: "ошибка 500"
    // });
});

app.listen(9120, function () { 
   console.log('Example app listening on port 9120!\n >> Enter the matrix? (red/blue)');
 });