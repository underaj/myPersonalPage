document.addEventListener('DOMContentLoaded', function() {
  function setBackground () {
    var curTime = new Date(),
    hour = curTime.getHours();
    if (hour <= 7 || hour >= 18) {
      document.body.style.backgroundImage = "url('photos/night.jpg')";
    } else if (hour <= 12) {
      document.body.style.backgroundImage = "url('photos/morning.jpg')";
    } else {
      document.body.style.backgroundImage = "url('photos/afternoon.jpg')";
    }
  }
  setBackground();
  // AJAX GET weather data
  function getWeather() {
    var weatherShow = document.getElementById('weather-show'),
    weatherLoc = document.getElementById('weather-loc'),
    myApi = '&appid=2de143494c0b295cca9337e1e96b00e0',
    myUrl;

    function getRequest(dataHandle) {
      var XHR;
      console.log(myUrl);
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
      console.log(data.main.temp);
      weatherShow.innerHTML = Math.round(data.main.temp - 273.15);
      weatherLoc.value = data.name;
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
      myUrl = getUrl(getInputLocation())('http://api.openweathermap.org/data/2.5/weather?q=',myApi);
      return getRequest(dispWeather);
    }

    getCurrentLocation();
  }

  getWeather();

  //To do list
  function toDoList() {
    var isAddOn = false, 
    taskCount = 0,
    inputTask = document.getElementById('input-Task'),
    userInTask = document.getElementById('userInTask'),
    userInDate = document.getElementById('userInDate');

    function addTask() {
      var curTask = userInTask.value,
      // curDate = userInDate.value,
      freshTaskLine = document.createElement('div'),
      delButton = addButton('button','col-xs-1','btn btn-link remove-button',"<i class='glyphicon glyphicon-remove-circle'></i>",'mousedown',function () {
        var parent = this.parentNode.parentNode.parentNode,
        child = this.parentNode.parentNode;
        parent.removeChild(child);
        taskCount--;
      }),
      taskDetail = addElement('input','col-xs-10','col-xs-12 taskDetail',curTask,function() {
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

      // use addElement to add the task and date
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

    document.getElementById('addTask-button').addEventListener('click', function () {
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
  }

  toDoList();

  // News api the guardian news 693f9530-f7ee-4eb7-9565-e5a0580c6c2a

// document.onclick = function() {
//   var highlightedWord = window.getSelection().toString();
//   if(highlightedWord == "") {
//     console.log('wtf');
//   } else {
//     console.log(highlightedWord);
//     defineWord(highlightedWord);
//   }
// }

  function getNewsFeed() {
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

    // function getUrl(userInput) {
    //   var myStr = '';
    //   myStr += userInput;
    //   return function (before,after) {
    //     myStr = before + myStr;
    //     if(after) {
    //       myStr = myStr +after;
    //     };
    //     return myStr;
    //   }
    // }

    getRequest(function(data) {
      console.log(data.results[0]);
    });
  }

  getNewsFeed();

});
