document.addEventListener('DOMContentLoaded', function() {

  function checkTime() {
    var curTime = new Date(),
    hour = curTime.getHours(),
    greeting = document.getElementById('greeting');
    if (hour <= 7 || hour >= 18) {
      document.body.style.backgroundImage = "url('photos/night.jpg')";
      greeting.innerHTML = 'Good Evening.';
    } else if (hour < 12) {
      document.body.style.backgroundImage = "url('photos/morning.jpg')";
      greeting.innerHTML = 'Good Morning.';
    } else {
      document.body.style.backgroundImage = "url('photos/afternoon.jpg')";
      greeting.innerHTML = 'Good Afternoon.';
    }
  }

  checkTime();

  // AJAX GET weather data
  function getWeather() {
    var weatherShow = document.getElementById('weather-show'),
    weatherLocation = document.getElementById('weather-loc'),
    myAppId = '&appid=2de143494c0b295cca9337e1e96b00e0',
    weatherCity = 'http://api.openweathermap.org/data/2.5/weather?q=',
    myUrl;

    function getRequest(dataHandle) {
      var XHR;

      function makeRequest(url) {
        XHR = new XMLHttpRequest();
        if (!XHR) {
          console.log('can\'t get data');
          return false;
        }
        XHR.onreadystatechange = function() {
          if (XHR.readyState === XMLHttpRequest.DONE && XHR.status === 200) {
            return dataHandle(JSON.parse(XHR.responseText));
          } else {
            console.log('Waiting for data');
          }
        };
        XHR.open('GET',url,true);
        XHR.send();
      }
      return makeRequest(myUrl);
    }

    function getUrl(userInput) {
      var myStr = '';
      myStr += userInput;
      return function (before,after) {
        myStr = before + myStr;
        if(after) {
          myStr = myStr +after;
        };
        return myStr;
      }
    }

    function dispWeather(data) {
      var weather = data.weather[0].main;
      var icon = data.weather[0].icon;
      document.getElementById('weather-icon').src = 'photos/weather/' + icon +'.png';
      weatherShow.innerHTML = '<h5>' + Math.round(data.main.temp - 273.15).toString() + '°C ' + weather + '</h5>';
      weatherLocation.value = data.name;
    }

    function getInputLocation() {
      if(weatherLocation.value === '') {
        weatherLocation.value = 'San Francisco';
      }
      return weatherLocation.value;
    }

    function getCurrentLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          myUrl = 'http://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+myAppId;
          getRequest(dispWeather);
        }, function () {
          myUrl = getUrl('San Francisco')(weatherCity,myAppId);
          getRequest(dispWeather);
        });
      } else {
        myUrl = getUrl('San Francisco')(weatherCity,myAppId);
        getRequest(dispWeather);
      }
    }

    weatherLocation.onclick = function() {
      this.value = '';
      this.setAttribute('class','on-Focus');
    }

    weatherLocation.onkeyup = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode == '13') {
        weatherLocation.blur();
        myUrl = getUrl(getInputLocation())(weatherCity,myAppId);
        return getRequest(dispWeather);
      }
    }

    weatherLocation.onblur = function() {
      this.setAttribute('class','off-Focus');
      myUrl = getUrl(getInputLocation())(weatherCity,myAppId);
      return getRequest(dispWeather);
    }

    getCurrentLocation();
  }

  getWeather();

  //To do list
  function toDoList() {
    var isAddOn = false,
    showTodo = false,
    taskCount = 0,
    completedCount = 0,
    inputTask = document.getElementById('input-task-row'),
    userInTask = document.getElementById('userInTask'),
    taskNotification = document.getElementById('task-notification');

    $.ajax({
      type: 'GET',
      url: 'https://chingtasksapp.herokuapp.com/tasks',
      dataType: 'JSON',
      success: function(res) {
        res.forEach(function(task) {
          addTask(task.content,task.id);
        });
        dispTaskNoti();
      }
    });

    function addTask(content,id) {
      var confirmChangeButton, cancelChangeButton,
      curTask = content || userInTask.value,
      freshTaskLine = document.createElement('div');
      completeButton = addButton('button','btn-md btn-link complete-button',"<i class='glyphicon glyphicon-ok-circle'></i>",'click',function () {
        var parent = this.parentNode.parentNode,
        child = this.parentNode,
        completedTaskDetail = this.parentNode.firstChild.firstChild;
        taskId = completedTaskDetail.getAttribute('data-id');
        document.getElementById('completed-list').innerHTML += "<div>"+completedTaskDetail.value+"</div>";
        parent.removeChild(child);
        taskCount--;
        completedCount++;
        dispTaskNoti();
        $.ajax({
          type: 'DELETE',
          url: 'https://chingtasksapp.herokuapp.com/tasks/'+taskId,
          dataType: 'JSON',
          success: function(res) {
          }
        });
      }), 
      delButton = addButton('button','btn-md btn-link remove-button',
      "<i class='glyphicon glyphicon-remove-circle'></i>",'mousedown',function () {
        var parent = this.parentNode.parentNode,
        child = this.parentNode;
        taskId = this.parentNode.firstChild.firstChild.getAttribute('data-id');
        parent.removeChild(child);
        taskCount--;
        dispTaskNoti();
        $.ajax({
          type: 'DELETE',
          url: 'https://chingtasksapp.herokuapp.com/tasks/'+taskId,
          dataType: 'JSON',
          success: function(res) {
          }
        });
      });

      taskDetail = document.createElement('div'),
      taskEle = document.createElement('input');
      taskDetail.setAttribute('class','col-xs-10');
      taskEle.setAttribute('class', 'col-xs-12 new-taskDetail');
      taskEle.setAttribute('data-isediton',false);
      if (id !== '') {
        taskEle.setAttribute('data-id',id);
      };
      taskEle.value = curTask;
      taskEle.addEventListener('mousedown',function() {
        var isEditOn = this.getAttribute('data-isediton'),
        confirmCancelDiv = document.createElement('div');
        closeInputTask();
        if (isEditOn === 'false') {
          var originalTask = this.value;
          this.setAttribute('data-originalTask',originalTask);
          this.setAttribute('data-isediton',true);
          confirmChangeButton = addButton('button','confirm-change-button btn-xs btn-primary','Change','mousedown',
            function () {
              var inEle = this.parentNode.parentNode.firstChild.firstChild,
              taskId = inEle.getAttribute('data-id'),
              data = {"task": {"content": inEle.value}};
              inEle.setAttribute('data-originalTask',inEle.value);
              $.ajax({
                type: 'PATCH',
                url: 'https://chingtasksapp.herokuapp.com/tasks/'+taskId,
                data: data,
                dataType: 'JSON',
                success: function(res) {
                }
              }); 
          });
          cancelChangeButton = addButton('button','cancel-change-button btn-xs btn-link','cancel','mousedown',
            function() {
              this.parentNode.parentNode.firstChild.firstChild.value = originalTask; 
          });
          this.parentNode.parentNode.lastChild.style.visibility = 'visible';
          this.parentNode.parentNode.appendChild(confirmCancelDiv);
          this.parentNode.parentNode.lastChild.appendChild(confirmChangeButton);
          this.parentNode.parentNode.lastChild.appendChild(cancelChangeButton);
        }
      });
      taskEle.addEventListener('blur',function() {
          var child = confirmChangeButton.parentNode;
          this.setAttribute('data-isediton',false);
          this.value = this.getAttribute('data-originalTask');
          confirmChangeButton.parentNode.removeChild(confirmChangeButton);
          cancelChangeButton.parentNode.removeChild(cancelChangeButton);
          child.parentNode.removeChild(child);
          this.parentNode.parentNode.lastChild.style.visibility = 'hidden';
      });
      
      function addButton(ele,myEleClas,innerCon,myEvent,myFunc,myType) { 
        var myButton = document.createElement(ele);
        myButton.setAttribute('class', myEleClas);
        myButton.innerHTML = innerCon;
        myButton.addEventListener(myEvent,myFunc);
        return myButton;
      }

      if (id == '') {
        var data = {"task": {"content": userInTask.value}};
        console.log(data);
        $.ajax({
          type: 'POST',
          url: 'https://chingtasksapp.herokuapp.com/tasks',
          data: data,
          dataType: 'JSON',
          success: function(res) {
            taskDetail.firstChild.setAttribute('data-id',res.id);
            console.log(res);
          }
        });
      }

      taskCount++;
      taskDetail.appendChild(taskEle);
      delButton.style.visibility = 'hidden';
      freshTaskLine.setAttribute('class', 'row');
      freshTaskLine.appendChild(taskDetail);
      freshTaskLine.appendChild(completeButton);
      freshTaskLine.appendChild(delButton);
      document.getElementById('todo-list').appendChild(freshTaskLine);
      userInTask.value = '';
    }

    function closeInputTask() {
      inputTask.style.display = 'none';
      userInTask.value = '';
      isAddOn = false;
    }

    function dispTaskNoti() {
      if (taskCount === 0) {
        taskNotification.innerHTML = 'Lets get something done today!';
      } else if (taskCount === 1) {
        taskNotification.innerHTML = 'You currently have ' + taskCount + ' task remaining.';
      } else {
        taskNotification.innerHTML = 'You currently have ' + taskCount + ' tasks remaining.';
      }
    }

    document.getElementById('addtask-button').addEventListener('click', function () {
      if (!isAddOn && taskCount < 10) {
        document.getElementById('completed-list').style.display = 'none';
        document.getElementById('todo-list').style.display = 'block';
        inputTask.style.display = "block";      
        userInTask.focus();
        isAddOn = true;
      }
    });

    document.getElementById('completedtask-button').addEventListener('click', function () {
      if (!isAddOn && completedCount) {
        document.getElementById('todo-list').style.display = 'none';
        document.getElementById('completed-list').style.display = 'block';
      }
    });

    document.getElementById('todo-button').addEventListener('click', function() {
      var todoBlock = document.getElementById('todowrap');
      if(!showTodo) {
        todoBlock.style.display = 'block';
        todoBlock.setAttribute('class','show-block col-xs-4 col-lg-3');
        showTodo = true;
      } else if (showTodo) {
        todoBlock.style.display = 'none';
        showTodo = false;
      }
      this.blur();
    });

    userInTask.onkeydown = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode == '13') {
        if (isAddOn && userInTask.value) {
          addTask('','');
          closeInputTask();
          dispTaskNoti();
        }
      }
    }

    document.getElementById('confirm-button').onclick = function() {
      if (isAddOn && userInTask.value) {
        addTask('','');
        closeInputTask();
        dispTaskNoti();
      }
    };

    document.getElementById('cancel-button').onclick = function() {
      if (isAddOn) {     
        closeInputTask();
      }
    };
  }

  toDoList();

  // News api

  function getNewsFeed() {
    var newsBlock = document.getElementById('newswrap');
    showNews = false;
    
    function getRequest(dataHandle) {
      var XHR, 
      myUrl = 'http://api.nytimes.com/svc/topstories/v1/world.json?api-key=b5f1430d9b082e1b2489f5c4036adedd:16:73712885';
      function makeRequest(url) {
        XHR = new XMLHttpRequest();
        if (!XHR) {
          console.log('can\'t get data');
          return false;
        }
        XHR.onreadystatechange = function() {
          if (XHR.readyState === XMLHttpRequest.DONE && XHR.status === 200) {
            return dataHandle(JSON.parse(XHR.responseText));
          } else {
            console.log('Waiting for data');
          }
        };
          ;
        XHR.open('GET',url,true);
        XHR.send();
      }
      return makeRequest(myUrl);
    }

    getRequest(function(data) {

      function addToFeed(num) {
        var news = data.results[num],
        myDiv = document.createElement('div');
        myDiv.setAttribute('class','col-xs-12 news-title-abstract');
        if (news['multimedia'] != "") {
          var imgWrap = document.createElement('div'),
          myImg = document.createElement('img');
          imgWrap.setAttribute('class','imgWrap');
          myImg.setAttribute('class','img-responsive');
          myImg.src = news.multimedia[4].url;  
          imgWrap.appendChild(myImg);
          imgWrap.innerHTML += "<span class='img-caption'>" + news.multimedia[4].caption + "</span>";
          myDiv.appendChild(imgWrap);
        }
        myDiv.innerHTML += '<h4><a href='+news.url+'>'+news.title+'</a></h4>' +
          '<p>'+news.abstract+'</p>';
        document.getElementById('news-content').appendChild(myDiv);
      }

      for(var i = 0;i < 10;i++) {
        addToFeed(i);
      }
    });

    document.getElementById('news-button').addEventListener('click', function() {
      if(!showNews) {
        newsBlock.style.display = 'block';
        newsBlock.setAttribute('class','show-block col-xs-5 col-lg-4');
        showNews = true;
      } else if (showNews) {
        newsBlock.style.display = 'none';
        showNews = false;
      }
      this.blur();
    });
  }
  
  getNewsFeed();

});
