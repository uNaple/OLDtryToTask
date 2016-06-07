(function(global, factory) {
  if ( typeof define === 'function' && define.amd ) {
      define([], factory);
  } else if ( typeof module !== 'undefined' && module.exports ){
      module.exports = factory();
  } else {
      global.Village = factory();
  }
})(this, function() {
  'use strict';

  var gameName = "Village Game";
  function logger(data, type){
    var bg = 'FBC02D';
    if (type == 1) { bg = '388E3C' }
    else if ( type == 2 ) { bg = '2196F3' }
    else if ( type == 3 ) { bg = 'FB8C00' }
    else if ( type == 4 ) { bg = 'E91E63' }
    var n = "color: #2196F3;",
        r = "background: #" + bg +"; color: #fff;",
        a = new Date();
    console.debug("%c"+gameName+":[" + a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds() + ":" + a.getMilliseconds() + "]%c " + data, r, n);
  }

  var arrayMethods = Object.getOwnPropertyNames( Array.prototype );
  arrayMethods.forEach( attachArrayMethodsToNodeList );
  function attachArrayMethodsToNodeList(methodName) {
    if(methodName !== "length") {
      NodeList.prototype[methodName] = Array.prototype[methodName];
    }
  };

  var Village = function() {
    this.event = {};
    this.resources = {};
    this.isWorking = false;
    this.inQuest = false;
    this.init();
  };
  
  Village.prototype.init = function() {
    this.tab     = this.findGameTab();
    this.initTalk(this.tab);
    this.history = this.findHistoryArea();
    this.startWatching(this.history);
    var self = this;
    this.interval = setInterval(function(){
      if(!self.isWorking && !self.inQuest) {
        self.newBreadHarvesting();
      }
      else {
        self.gotoQuest();
      }
    }, 8000);
  };

  Village.prototype.findGameTab = function(){
    var tabs = document.querySelectorAll('.im_dialogs_col ul>li>a');
    for (var tid = 0; tid<tabs.length;tid++) {
      if (tabs[tid].querySelector('.im_dialog_peer>span').textContent == gameName) {
        return tabs[tid];
      }
    }
    return null;
  };

  Village.prototype.initTalk = function(){
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    this.event.mousedown = event;
    this.tab.dispatchEvent(event);
  };

  Village.prototype.findHistoryArea = function(){
    var history = document.querySelector('.im_history_messages_peer');
    if (history.children.length) return history;
    return null;
  };

  Village.prototype.startWatching = function(elem) {
    var self = this;
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type == "childList") {
          mutation.addedNodes.forEach(function(node){
            if (node.nodeName == "DIV") {
              node.focus();
              if (node.querySelector('a.im_message_author').textContent == gameName) {
                logger("New message");
                var img = node.querySelector('.im_message_photo_caption'),
                   text = node.querySelector('.im_message_text');
                if (img !== null) {
                  self.newMessage(img.textContent);
                }
                else {
                  self.newMessage(text.textContent);
                }
              }
            }
          });
        }
      });    
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.observer = observer;
    observer.observe(elem, config);

    return observer;
  };


  Village.prototype.newMessage = function(msg) {
    var self = this;
    setTimeout(function(){
      if (msg.match(/Урожай:/)) self.updateResources(msg);

      if (msg.match(/^Работа окончена/)) {
        self.isWorking = false;
        return true;
      }
      if (msg.match(/^(Вы начали работать|Вы еще работаете)/)) {
        self.isWorking = true;
        return true;
      }
      if (msg.match(/^Ваши поля заполнены/)) {
        self.sellBread();
        return true;
      }

      // Start quests
      if (msg.match(/^Нужно не только паха/)) {
        self.selectQuest();
        return true;
      }
      if (msg.match(/^Рядом с одной из деревень/)) {
        self.startQuest();
        return true;
      }
      if (msg.match(/^Бандиты оказались крепкими ребятами/)) {
        self.helpInQuest();
        return true;
      }
      if (msg.match(/^(Ваш подоспевший отряд|Эти бандиты оказались трусами)/)) {
        self.finishQuest();
        return true;
      }
    }, 1000);
  };




  Village.prototype.newBreadHarvesting = function() {
    this.isWorking = true;
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/bread/)) {
        btn.click();
        logger('Harvesting bread',1);
      }
    })
  };

  Village.prototype.updateResources = function(msg) {
    logger("Resources updated", 2);
    var bread = msg.match(/:Урожай: (.*) :bread:/);
    this.resources.bread = parseInt(bread[1].split('/')[0]);
    this.resources.angar = parseInt(bread[1].split('/')[1]);

    var gold = msg.match(/:Золото: (.*) :moneybag:/);
    this.resources.gold = parseInt(gold[1]);

    var gems = msg.match(/moneybag:(.*):gem/);
    this.resources.gems = parseInt(gems[1]);

    var farmers = msg.match(/\)Рабочих: (.*) :man:/);
    this.resources.farmers = parseInt(farmers[1]);

    var medals = msg.match(/:Медали: (.+):heavy/);
    this.resources.medals = parseInt(medals[1]);

    if ((this.resources.bread / this.resources.angar) > 0.6) {
      this.sellBread();
    }

    if (this.resources.gold > 100) {
      // go to attack!!!
    }
  };

  Village.prototype.sellBread = function() {
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/back/)) {
        btn.click();
        logger('Go to main menu',3);
      }
    });
    setTimeout(function(){
      document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
        if (btn.textContent.match(/moneybag/)) {
          btn.click();
          logger('Sold bread',1);
        }
      })
    }, 1000);
  };

  // Quests logic
  Village.prototype.gotoQuest = function(){
    this.inQuest = true;
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/Квесты/)) {
        logger('Go to quests',4);
        btn.click();
        return true;
      }
    });
  };

  Village.prototype.selectQuest = function(){
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/Спасти деревню/)) {
        logger('Quest ⭐️⭐️⭐️ select', 4);
        btn.click();
        return true;
      }
    });
  };

  Village.prototype.startQuest = function(){
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/Выполнить задание/)) {
        logger('Quest ⭐️⭐️⭐️ start', 4);
        btn.click();
        return true;
      }
    });
  };
  
  Village.prototype.helpInQuest = function(){
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/Отправить подмогу/)) {
        logger('Quest ⭐️⭐️⭐️ help', 4);
        btn.click();
        return true;
      }
    });
  };
  Village.prototype.finishQuest = function(){
    this.inQuest = false;
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/back/)) {
        logger('Quest ⭐️⭐️⭐️ finished', 4);
        btn.click();
      }
    });
  };

  Village.prototype.debugGameObject = function() {
    console.debug(this);
  }

  Village.prototype.stop = function() {
    this.observer.disconnect();
    clearInterval(this.interval);
  }

  return Village;
});

var game = new Village();