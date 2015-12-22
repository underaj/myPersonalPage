document.addEventListener('DOMContentLoaded', function() {

  // Acquiring the time to set greeting message and background image
  function checkTime() {
    var curTime = new Date();
    var hr = curTime.getHours();
    var greeting = document.getElementById('greeting');
    if (hr <= 7 || hr >= 18) {
      document.body.style.backgroundImage = 'url(\'photos/night.jpg\')';
      greeting.innerHTML = 'Good Evening.';
    } else if (hr < 12) {
      document.body.style.backgroundImage = 'url(\'photos/morning.jpg\')';
      greeting.innerHTML = 'Good Morning.';
    } else {
      document.body.style.backgroundImage = 'url(\'photos/afternoon.jpg\')';
      greeting.innerHTML = 'Good Afternoon.';
    }
  }

  checkTime();

  // AJAX GET weather data for top left weather box
  function getWeather() {
    var weatherShow = document.getElementById('weather-show');
    var weatherLocation = document.getElementById('weather-loc');
    var myAppId = '&appid=2de143494c0b295cca9337e1e96b00e0';
    var weatherCity = 'http://api.openweathermap.org/data/2.5/weather?q=';
    var myUrl;
    var XHR;

    /**
     * GET weather data request using XMLHttpRequest
     * with Callback function (dataHandle) for when 
     * request is successful
     */
    function getRequest(dataHandle) {
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

    // The dataHandle function displaying weather
    function dispWeather(data) {
      var weather = data.weather[0].main;
      var icon = data.weather[0].icon;
      var weatherIcon = document.getElementById('weather-icon');
      weatherIcon.src = 'photos/weather/' + icon +'.png';
      weatherShow.innerHTML = '<h5>' + 
        Math.round(data.main.temp - 273.15).toString() +
        '°C ' + weather + '</h5>';
      weatherLocation.value = data.name;
    }

    function getUrl(userInput) {
      var myStr = '';
      myStr += userInput;
      return function (before,after) {
        myStr = before + myStr;
        if (after) {
          myStr = myStr +after;
        }

        return myStr;
      };
    }

    //If weatherLoc input is empty, sets location to  San Francisco
    function getInputLocation() {
      if (weatherLocation.value === '') {
        weatherLocation.value = 'San Francisco';
      }

      return weatherLocation.value;
    }

    // Using Geolocation to find the User, and get their local weather
    function getGeoLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          myUrl = 'http://api.openweathermap.org/data/2.5/weather?lat='+
            pos.coords.latitude + '&lon=' +pos.coords.longitude+myAppId;
          getRequest(dispWeather);
        }, function() {
          myUrl = getUrl('San Francisco')(weatherCity,myAppId);
          getRequest(dispWeather);
        });
      } else {
        myUrl = getUrl('San Francisco')(weatherCity,myAppId);
        getRequest(dispWeather);
      }
    }

    // The location can be changed by clicking the weatherLocation
    weatherLocation.onclick = function() {
      this.setAttribute('class','on-Focus');
      this.value = '';
    };

    // Runs the GET weather request when enter is pressed in weatherLocation
    weatherLocation.onkeyup = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode === 13) {
        this.blur();
        myUrl = getUrl(getInputLocation())(weatherCity,myAppId);
        return getRequest(dispWeather);
      }
    };

    // Runs the GET weather request when weatherLocation losses focus
    weatherLocation.onblur = function() {
      this.setAttribute('class','off-Focus');
      myUrl = getUrl(getInputLocation())(weatherCity,myAppId);
      return getRequest(dispWeather);
    };

    getGeoLocation();
  }

  getWeather();

  //To do list
  function toDoList() {
    var inputTask = document.getElementById('input-task-row');
    var userInTask = document.getElementById('userInTask');
    var taskNotification = document.getElementById('task-notification');
    var isAddOn = false;
    var showTodo = false;
    var taskCount = 0;
    var completedCount = 0;

    //Runs an AJAX call to GET data from server and get saved to-do tasks
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

    /** 
     * addTask function is called either when the previous AJAX
     * get saved tasks  or User adds new task, with saved tasks, 
     * the task description (content) and ID is passed to the function
     */
    function addTask(content,id) {
      var curTask = content || userInTask.value;
      var freshTaskLine = document.createElement('div');
      var taskDetail = document.createElement('div');
      var taskEle = document.createElement('input');
      var confirmChangeButton;
      var cancelChangeButton;
      var completeButton = addButton('button','btn-md btn-link complete-button',
        '<i class=\'glyphicon glyphicon-ok-circle\'></i>', 'click',
        function() {
          var parent = this.parentNode.parentNode;
          var child = this.parentNode;
          var completedTaskDetail = this.parentNode.firstChild.firstChild;
          var taskId = completedTaskDetail.getAttribute('data-id');
          document.getElementById('completed-list').innerHTML += '<div>'+
           completedTaskDetail.value+'</div>';
          taskCount--;
          completedCount++;
          dispTaskNoti();
          parent.removeChild(child);
          $.ajax({
            type: 'DELETE',
            url: 'https://chingtasksapp.herokuapp.com/tasks/' + taskId,
            dataType: 'JSON',
            success: function() {
            }
          });
      });

      var delButton = addButton('button', 'btn-md btn-link remove-button',
        '<i class=\'glyphicon glyphicon-remove-circle\'></i>', 'mousedown',
        function() {
          var parent = this.parentNode.parentNode;
          var child = this.parentNode;
          var taskId = this
              .parentNode
            .firstChild
              .firstChild
              .getAttribute('data-id');
          taskCount--;
          dispTaskNoti();
          parent.removeChild(child);
          $.ajax({
            type: 'DELETE',
            url: 'https://chingtasksapp.herokuapp.com/tasks/' + taskId,
            dataType: 'JSON',
            success: function() {
            }
          });
      });

      /**
       * Buttons created with their own specifications and different 
       *callback functions triggered by their eventListener
       */
      function addButton(ele,myEleClas,innerCon,myEvent,myFunc) { 
        var myButton = document.createElement(ele);
        myButton.setAttribute('class', myEleClas);
        myButton.addEventListener(myEvent,myFunc);
        myButton.innerHTML = innerCon;
        return myButton;
      }

      /**
       * Checks whether task is new or retrieved from server, if task was
       * retrieved, sets the id assigned by server to the task element
       */
      if (id !== '') {
        taskEle.setAttribute('data-id', id);
      }

      taskDetail.setAttribute('class','col-xs-10');
      taskEle.setAttribute('class', 'col-xs-12 new-taskDetail');
      taskEle.setAttribute('data-isediton',false);
      taskEle.value = curTask;
      /**When task element is clicked, user can alter the task, which
      the user can confirm or cancel the change**/
      taskEle.addEventListener('mousedown',function() {
        var isEditOn = this.getAttribute('data-isediton');
        var confirmCancelDiv = document.createElement('div');
        closeInputTask();
        if (isEditOn === 'false') {
          var originalTask = this.value;
          this.setAttribute('data-originalTask',originalTask);
          this.setAttribute('data-isediton',true);
          confirmChangeButton = addButton('button',
            'confirm-change-button btn-xs btn-primary','Change','mousedown',
            function() {
              var inEle = this.parentNode.parentNode.firstChild.firstChild;
              var taskId = inEle.getAttribute('data-id');
              var data = {'task': {'content': inEle.value}};
              inEle.setAttribute('data-originalTask',inEle.value);
              /**
               * Searches the server for same task ID,
               * Patches the task detail if user confirms to change it
               */
              $.ajax({
                type: 'PATCH',
                url: 'https://chingtasksapp.herokuapp.com/tasks/'+taskId,
                data: data,
                dataType: 'JSON',
                success: function() {
                }
              }); 
          });

          cancelChangeButton = addButton('button',
            'cancel-change-button btn-xs btn-link','cancel','mousedown',
            function() {
              this.parentNode
              .parentNode
            .firstChild
            .firstChild
              .value = originalTask;
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
      
      /**
       * If new task is created, AJAX POST the task detail to server. 
       * When successful, retrieves the ID assigned by server and sets it 
       * to the corresponding task element's data-id attribute.
       */
      if (id === '') {
        var data = {'task': {'content': userInTask.value}};
        $.ajax({
          type: 'POST',
          url: 'https://chingtasksapp.herokuapp.com/tasks',
          data: data,
          dataType: 'JSON',
          success: function(res) {
            taskDetail.firstChild.setAttribute('data-id',res.id);
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
        taskNotification.innerHTML = 'You currently have ' + taskCount +
          ' task remaining.';
      } else {
        taskNotification.innerHTML = 'You currently have ' + taskCount +
          ' tasks remaining.';
      }
    }

    document.getElementById('addtask-button')
    .addEventListener('click', function() {
      if (!isAddOn && taskCount < 10) {
        document.getElementById('completed-list').style.display = 'none';
        document.getElementById('todo-list').style.display = 'block';
        inputTask.style.display = 'block';      
        userInTask.focus();
        isAddOn = true;
      }
    });

    document.getElementById('completedtask-button')
    .addEventListener('click', function() {
      if (!isAddOn && completedCount) {
        document.getElementById('todo-list').style.display = 'none';
        document.getElementById('completed-list').style.display = 'block';
      }
    });

    document.getElementById('todo-button')
    .addEventListener('click', function() {
      var todoBlock = document.getElementById('todowrap');
      if (!showTodo) {
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
      if (keyCode === 13) {
        if (isAddOn && userInTask.value) {
          addTask('','');
          closeInputTask();
          dispTaskNoti();
        }
      }
    };

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
    var showNews = false;
    
    /**
     * GET News data request using XMLHttpRequest
     * with Callback function (dataHandle) for 
     * when request is successful
     */
    function getRequest(dataHandle) {
      var XHR;
      var myUrl = 'http://api.nytimes.com/svc/topstories/v1/'+
       'world.json?api-key=b5f1430d9b082e1b2489f5c4036adedd:16:73712885';
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
            console.log('Waiting for news data');
          }
        };
        XHR.open('GET',url,true);
        XHR.send();
      }
      return makeRequest(myUrl);
    }

    /** 
     * Callback function to handle data retrieved from NYTimes API.
     * showing each news' image, title and abstract in the news tab.
     */
    getRequest(function(data) {
      function addToFeed(num) {
        var news = data.results[num];
        var myDiv = document.createElement('div');
        myDiv.setAttribute('class','col-xs-12 news-title-abstract');
        document.getElementById('news-content').appendChild(myDiv);
        if (news.multimedia !== '') {
          var imgWrap = document.createElement('div');
          var myImg = document.createElement('img');
          imgWrap.setAttribute('class','imgWrap');
          myImg.setAttribute('class','img-responsive');
          myImg.src = news.multimedia[4].url;  
          imgWrap.appendChild(myImg);
          myDiv.appendChild(imgWrap);
          if (news.multimedia[4].caption !== '') {
            imgWrap.innerHTML += '<span class=\'img-caption\'>' + 
              news.multimedia[4].caption + '</span>';
          }

        myDiv.innerHTML += '<h4><a href='+news.url+'>'+news.title+'</a></h4>' +
          '<p>'+news.abstract+'</p>';
        }
      }
      
      for (var i = 0; i<20; i++) {
        addToFeed(i);
      }
    });

    document.getElementById('news-button')
    .addEventListener('click', function() {
      if (!showNews) {
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
