"use strict";
// var task = {
// 	name : "task1",
// 	director : "director",//постановщик
// 	controller : "controller",//контроллер	
// 	executor : "executor",//исполнитель

// 	timeOfSet : Date(),//Время установки
// 	timeOfStart : Date(),//время начала
// 	timeOfEnd : Date(),//время конца
	
// 	status : "В процессе",//статус задачи
// 	parent : "insystem"//родитель

// }

var db 			= require('./db');
var express 	= require('express');
var app 		= express();
var path		= require('path');
var bodyParser 	= require('body-parser')


function myTask() {           				//объект Задание
	this.id = null;
	this.name = 'New Task';//заголовок
	this.type = null;//тип задачи: задача, подзадача, проект
	this.director = 'insystem';//постановщик
	this.controller = 'insystem';//контроллером изначально ставится директор	
	this.executor = null;//исполнитель

	this.timeOfSet = db.getNowDate();//Время установки
	this.timeOfStart = null;//Время начала
	this.timeOfEnd = null;//Время конца
	
	this.status = null;//статус задачи
	this.parent = null;//родитель, если задача принадлежит проекту или является подзадачей

	this.description = null;//описание
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
var recieve = 'Леша',
	give = 'Саша';

var task1 = new myTask(),
 	task2 = new myTask();

//db.createTable('history');
//db.createTable('users');
//db.createTable('tasks');
//db.createTable('TEST NULL TABLE');

//db.deleteTable('tasks');
//randomFill(20);
//db.reassignTask(recieve,give);	
//db.loadTask(process.argv[2]);
//db.addTask(task1);

// for(var i = 1; i < 6; i++){
// 	task1.id = i;
// 	task1.type = typeArray[getRandom(0,3)];
// 	task1.description = 'fsddsgfdsf';
// 	task1.name = 'GHKUda';
// 	db.updateTask(task1);
// }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(req, res){
	res.render('index', {
				title: 'TASK MANAGER YOPTA'})
})

app.get('/edit', function(req,res){
	//var task = JSON.parse(req.query.task);
	//console.log(req.query);
	res.render('edit', {
		title: 'TASK MANAGER YOPTA',
		task: JSON.parse(req.query.task)
	})
})

app.get('/update', function(req,res){
	console.log(req.query);
	//var obj = JSON.stringify(req.query);
	db.updateTask(req.query);
	res.redirect('/showall');
	// {
	// 			title: 		'TASK MANAGER YOPTA',
	// 			tmpTask: 	
	// 		})
})

app.get('/add', function(req,res){
	var obj = req.query;
	res.render('add', {
		title: 'TASK MANAGER YOPTA'
	});
})

app.get('/show', function (req, res) {
	//console.log('input id: ' + req.body.id || req.params.id || req.query.id);
	db.loadTask(req.body.id || req.params.id || req.query.id, function(err, tmpTask){
		if(err){
			console.log(err.message);
			res.render('index', {
							error: err.message})
		}
		else{
			res.render('show', {
				title: 		'TASK MANAGER YOPTA',
				tmpTask: 	tmpTask
				// id: 		tmpTask.id,
				// taskName: 	tmpTask.Заголовок,
				// type : 		tmpTask.Тип,
				// director : 	tmpTask.Постановщик,
				// controller :tmpTask.Контроллер,
				// executor: 	tmpTask.Исполнитель,
				// timeOfSet: 	tmpTask.Время_постановки,
				// status: 	tmpTask.Статус,
				// description:tmpTask.Описание
			})
		}
	})	
});

app.get('/showall', function (req, res) {
	db.loadAll(function(tmpTask){
		res.render('showall', {
					rows: tmpTask})
		})
	}
);

app.post('/', function(req,res,next){
	task2.name = req.body.title;
	console.log(req.body.title + " " + req.body.data);
})

// app.use(function(req, res, next) {
//     res.status(404).render("pages/error", {
//         title: "ошибка 404",
//         msg: "ошибка 404"
//     });

//     res.status(500).render("pages/error", {
//         title: "ошибка 500",
//         msg: "ошибка 500"
//     });
// });

app.listen(9120, function () { 
   console.log('Example app listening on port 9120!');
 });