
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
    this.init();
  };
  
  Village.prototype.init = function() {
    this.tab     = this.findGameTab();
    this.initTalk(this.tab);
    this.history = this.findHistoryArea();
    this.startWatching(this.history);
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
                self.newMessage(node.querySelector('.im_message_text').textContent);
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
    if (msg.match(/^Работа окончена/)) this.newBreadHarvesting();
    if (msg.match(/Урожай:/)) this.updateResources(msg);
    if (msg.match(/^Ваши поля заполнены/)) this.sellBread();
  };

  Village.prototype.newBreadHarvesting = function() {
    document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
      if (btn.textContent.match(/back/)) {
        btn.click();
        logger('Go to main menu',3);
      }
    });
    setTimeout(function(){
      document.querySelectorAll('.im_send_keyboard_wrap button').forEach(function(btn){
        if (btn.textContent.match(/bread/)) {
          btn.click();
          logger('Harvesting bread',1);
        }
      })
    }, 1000);
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

  Village.prototype.debugGameObject = function() {
    console.debug(this);
  }

  Village.prototype.stop = function() {
    this.observer.disconnect();
  }

  return Village;
});

var game = new Village();