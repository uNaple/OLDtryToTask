function Task () {
 var _taskname, _taskowner;

 this.setOwner    = function (OwnerName) { _taskowner = OwnerName; }
 this.setTaskName = function (TaskName) { _taskname = TaskName; }

 this.getOwner    = function () { return _taskowner; }
 this.getTaskName = function () { return _taskname; }

 this.store = function () {
 	console.log('----------------------------------------------------------------------');
 	console.log('store Task()');

 	console.log('name: '+this.getTaskName() + ' | ' + _taskname);
 	console.log('owner: '+this.getOwner() + ' | ' + _taskowner);
 }
}

Task.prototype.store_2 = function() {
	console.log('PROTO: '+this.getOwner());
};

var task1 = new Task();

// task1.store();
// task1.setOwner('Test owner');
// task1.store();
// task1.setTaskName('Task name');
// task1.store();
// task1.store_2();



function some_function(arg1, arg2, callback) {
    // переменная, генерирующая случайное число в интервале между arg1 и arg2
    var my_number = Math.ceil(Math.random() * (arg1 - arg2) + arg2);
    // теперь всё готово и  мы вызываем callback, куда передаём наш результат
    callback(my_number);
}
// вызываем функцию
some_function(5, 15, function (num) {
	console.log('dsadas');
    // эта анонимная функция выполнится после вызова callback-функции
    console.log("callback called! " + num);
    	console.log('dsadadsadasdasdasdasd');
});
