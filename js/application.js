
document.addEventListener('DOMContentLoaded', function() {

  // AJAX GET weather data
  function getWeather() {
    var weatherShow = document.getElementById('weather-show'),
    weatherLoc = document.getElementById('weather-loc');

    function getRequest(dataHandle) {
      var XHR, 
      myUrl = getUrl(getLocation())('http://api.openweathermap.org/data/2.5/weather?q=','&appid=2de143494c0b295cca9337e1e96b00e0');
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

    function getLocation() {
      if(weatherLoc.value === '') {
        weatherLoc.value = 'San Francisco';
      }
      return weatherLoc.value;
    }

    weatherLoc.onkeyup = function(e) {
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      // if enter is pressed
      if (keyCode == '13') {
        weatherLoc.blur();
        return getRequest(dispWeather);
      }
    }

    getRequest(function (data) {
      console.log(data.main.temp);
      weatherShow.innerHTML = Math.round(data.main.temp - 273.15);
      weatherLoc.value = data.name;
    });

  }

  getWeather();

  //To do list
  function toDoList() {
    var isAddOn = false, 
    isEditOn = false,
    taskCount = 0,
    inputTask = document.getElementById('input-Task'),
    userInTask = document.getElementById('userInTask'),
    userInDate = document.getElementById('userInDate');

    function addTask() {
      var curTask = userInTask.value,
      curDate = userInDate.value,
      freshTask = document.createElement('task'),
      delButton = addElement('button','btn btn-link remove-button',
      "<i class='glyphicon glyphicon-remove-circle'></i>", 
      function () {
        var parent = this.parentNode.parentNode;
        var child = this.parentNode;
        parent.removeChild(child);
      });

      function addElement (ele, myClas,innerCon,myFunc) {
        // add as input element
        var myEle = document.createElement(ele);
        myEle.setAttribute('class', myClas);
        myEle.innerHTML = innerCon;
        myEle.addEventListener('click',myFunc);
        return myEle;
      }

      // use addElement to add the task and date

      // function eleToStr (ele) {
      //   var myDiv = document.createElement('div');
      //   myDiv.appendChild(ele);
      //   return myDiv.innerHTML;
      // }

      inputTask.style.display = "none";      
      freshTask.innerHTML = "<div class='col-xs-6'>" +
        curTask + "</div>" +
        "<div class='col-xs-4'>" +
        curDate + "</div>";
      freshTask.appendChild(delButton);
      document.getElementById('todo-List').appendChild(freshTask);
      userInTask.value = '';
      userInDate.value = '';
    }

    document.getElementById('addTask-button').onclick = function () {
      if (!isAddOn) {
        return function() {
          inputTask.style.display = "block";      
          userInTask.focus();
          isAddOn = true;
        }();
      }
    };

    document.getElementById('confirm-button').onclick = function () {
      if (isAddOn && userInTask.value) {
        addTask();
        isAddOn = false;
      }
    };

    document.getElementById('cancel-button').onclick = function () {
      if (isAddOn) {
        inputTask.style.display = "none";      
        userInTask.value = '';
        userInDate.value = '';
        isAddOn = false;
      }
    };
  }

  toDoList();
});