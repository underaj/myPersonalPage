document.addEventListener('DOMContentLoaded', function() {

  var curTime = new Date(),
  hour = curTime.getHours();

  function checkTime() {
    greeting = document.getElementById('greeting');
    if (hour <= 7 || hour >= 18) {
      document.body.style.backgroundImage = "url('photos/night.jpg')";
      greeting.innerHTML = 'Good Evening.';
    } else if (hour <= 12) {
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
    weatherLoc = document.getElementById('weather-loc'),
    myApi = '&appid=2de143494c0b295cca9337e1e96b00e0',
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
          ;
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
      console.log(data);
      var weather = data.weather[0].main;
      var icon = data.weather[0].icon;
      console.log(icon);
      document.getElementById('weather-icon').src = 'photos/weather/' + icon +'.png';
      weatherShow.innerHTML = '<h5>' + Math.round(data.main.temp - 273.15).toString() + '°C ' + weather + '</h5>';
      weatherLoc.value = data.name;

      // function (weat) {
      //   var 
      // }
    }

    function getInputLocation() {
      if(weatherLoc.value === '') {
        weatherLoc.value = 'San Francisco';
      }
      return weatherLoc.value;
    }

    function getCurrentLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pos) {
          console.log('here');
          myUrl = 'http://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+myApi;
          getRequest(dispWeather);
        }, function () {
          myUrl = getUrl('San Francisco')('http://api.openweathermap.org/data/2.5/weather?q=',myApi);
          getRequest(dispWeather);
        });
      } else {
        myUrl = getUrl('San Francisco')('http://api.openweathermap.org/data/2.5/weather?q=',myApi);
        getRequest(dispWeather);
      }
    }

    weatherLoc.onkeyup = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode == '13') {
        weatherLoc.blur();
        myUrl = getUrl(getInputLocation())('http://api.openweathermap.org/data/2.5/weather?q=',myApi);
        return getRequest(dispWeather);
      }
    }

    weatherLoc.onblur = function() {
      this.setAttribute('class','off-Focus');
      myUrl = getUrl(getInputLocation())('http://api.openweathermap.org/data/2.5/weather?q=',myApi);
      return getRequest(dispWeather);
    }

    weatherLoc.onfocus = function() {
      this.setAttribute('class','on-Focus');
    }

    getCurrentLocation();
  }

  getWeather();

  //To do list
  function toDoList() {
    var isAddOn = false, 
    taskCount = 0,
    showTodo = false,
    inputTask = document.getElementById('input-Task'),
    userInTask = document.getElementById('userInTask'),
    userInDate = document.getElementById('userInDate');

    function addTask() {
      var curTask = userInTask.value,
      // curDate = userInDate.value,
      freshTaskLine = document.createElement('div'),
      delButton = addButton('button','col-xs-1','btn-s btn-link remove-button',"<i class='glyphicon glyphicon-remove-circle'></i>",'mousedown',function () {
        var parent = this.parentNode.parentNode.parentNode,
        child = this.parentNode.parentNode;
        this.parentNode.parentNode.firstChild.firstChild.setAttribute('class','removed-taskDetail');
        parent.removeChild(child);
        taskCount--;
      }),
      taskDetail = addElement('input','col-xs-10','col-xs-12 new-taskDetail',curTask,function() {
        var isEditOn = this.getAttribute('isEditOn');
        closeInputTask();
        if (isEditOn === 'false') {
          var originalTask = this.value;
          this.setAttribute('originalTask',originalTask);
          this.setAttribute('isEditOn',true);
          confirmChangeButton = addButton('button','col-xs-3','btn-xs btn-primary','Change','mousedown',
            function () {
              var inEle = this.parentNode.parentNode.firstChild.firstChild;
              inEle.setAttribute('originalTask',inEle.value); 
          });
          cancelChangeButton = addButton('button','col-xs-3','btn-xs btn-link','cancel','mousedown',
            function() {
              this.parentNode.parentNode.firstChild.firstChild.value = originalTask; 
          });
          this.parentNode.parentNode.appendChild(confirmChangeButton);
          this.parentNode.parentNode.appendChild(cancelChangeButton);
          delButton.style.visibility = 'visible';
        }
      },function() {
          this.setAttribute('isEditOn',false);
          this.value = this.getAttribute('originalTask');
          confirmChangeButton.parentNode.removeChild(confirmChangeButton);
          cancelChangeButton.parentNode.removeChild(cancelChangeButton);
          delButton.style.visibility = 'hidden';
      }), confirmChangeButton, cancelChangeButton;

      function addButton(ele,myDivClas,myEleClas,innerCon,myEvent,myFunc) {
        var myDiv = document.createElement('div'),
        myEle = document.createElement(ele);
        myDiv.setAttribute('class',myDivClas);
        myEle.setAttribute('class', myEleClas);
        myEle.innerHTML = innerCon;
        myEle.addEventListener(myEvent,myFunc);
        myDiv.appendChild(myEle);
        return myDiv;
      }

      function addElement(ele,myDivClas,myEleClas,innerCon,myFunc,myFunc2) {
        var myDiv = document.createElement('div'),
        myEle = document.createElement(ele);
        myDiv.setAttribute('class',myDivClas);
        myEle.setAttribute('class', myEleClas);
        myEle.setAttribute('isEditOn',false);
        myEle.value = innerCon;
        myEle.addEventListener('mousedown',myFunc);
        myEle.addEventListener('blur',myFunc2);
        myDiv.appendChild(myEle);
        return myDiv;
      }

      delButton.style.visibility = 'hidden';
      freshTaskLine.setAttribute('class', 'row');
      freshTaskLine.appendChild(taskDetail);
      freshTaskLine.appendChild(delButton);
      document.getElementById('todo-List').appendChild(freshTaskLine);
      userInTask.value = '';
      // userInDate.value = '';
    }

    function closeInputTask() {
      inputTask.style.display = "none";
      userInTask.value = '';
      // userInDate.value = '';
      isAddOn = false;
    }

    document.getElementById('addtask-button').addEventListener('click', function () {
      if (!isAddOn && taskCount < 6) {
          inputTask.style.display = "block";      
          userInTask.focus();
          isAddOn = true;
      }
    });

    userInTask.onkeydown = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode == '13') {
        if (isAddOn && userInTask.value) {
          addTask();
          taskCount++;
          closeInputTask();
        }
      }
    }

    document.getElementById('confirm-button').onclick = function() {
      if (isAddOn && userInTask.value) {
        addTask();
        taskCount++;
        closeInputTask();
      }
    };

    document.getElementById('cancel-button').onclick = function() {
      if (isAddOn) {     
        closeInputTask();
      }
    };

    document.getElementById('todo-button').addEventListener('click', function() {
      var todoBlock = document.getElementById('todowrap');
      if(!showTodo) {
        todoBlock.style.display = 'block';
        todoBlock.setAttribute('class','show-block col-xs-3');
        showTodo = true;
      } else if (showTodo) {
        todoBlock.style.display = 'none';
        showTodo = false;
      }
      this.blur();
    });
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
        newsBlock.setAttribute('class','show-block col-xs-4');
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
