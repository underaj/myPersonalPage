
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
    // isEditOn = 0,
    taskCount = 0,
    inputTask = document.getElementById('input-Task'),
    userInTask = document.getElementById('userInTask'),
    userInDate = document.getElementById('userInDate');

    function addTask() {
      var curTask = userInTask.value,
      curDate = userInDate.value,
      freshTaskLine = document.createElement('div'),
      confirmChangeButton,
      cancelChangeButton,
      delButton = addButton('button','col-xs-1','btn btn-link remove-button',"<i class='glyphicon glyphicon-remove-circle'></i>", 'mousedown',
        function () {
          var parent = this.parentNode.parentNode.parentNode,
          child = this.parentNode.parentNode;
          parent.removeChild(child);
          taskCount--;
        }),
      taskDetail = addElement('input','col-xs-10','col-xs-12 taskDetail',curTask,
        function () {
          closeInputTask();
          var isEditOn = parseFloat(this.getAttribute('isEditOn')) + 1;
          this.setAttribute('isEditOn',isEditOn);
          console.log(isEditOn);
          console.log('focus in element');
          if (isEditOn === 1) {
            var originalTask = this.value;
            this.setAttribute('originalTask',originalTask);
            confirmChangeButton = addButton('button','col-xs-3','btn-xs btn-primary','Change','mousedown',
              function () {
                var inEle = this.parentNode.parentNode.firstChild.firstChild;
                inEle.setAttribute('originalTask',inEle.value); 
            });

            cancelChangeButton = addButton('button','col-xs-3','btn-xs btn-link','cancel','mousedown',
              function () {
                this.parentNode.parentNode.firstChild.firstChild.value = originalTask; 
            });

            this.parentNode.parentNode.appendChild(confirmChangeButton);
            this.parentNode.parentNode.appendChild(cancelChangeButton);
            delButton.style.visibility = 'visible';
          }
        },
        function () {
          console.log('blur out');
          this.setAttribute('isEditOn',0);
          this.value = this.getAttribute('originalTask');
          confirmChangeButton.parentNode.removeChild(confirmChangeButton);
          cancelChangeButton.parentNode.removeChild(cancelChangeButton);
          delButton.style.visibility = 'hidden';
        });

      function addButton (ele,myDivClas,myEleClas,innerCon,myEvent,myFunc) {
        var myDiv = document.createElement('div'),
        myEle = document.createElement(ele);
        myDiv.setAttribute('class',myDivClas);
        myEle.setAttribute('class', myEleClas);
        myEle.innerHTML = innerCon;
        myEle.addEventListener(myEvent,myFunc);
        myDiv.appendChild(myEle);
        return myDiv;
      }

      function addElement (ele,myDivClas,myEleClas,innerCon,myFunc,myFunc2) {
        var myDiv = document.createElement('div'),
        myEle = document.createElement(ele);
        myDiv.setAttribute('class',myDivClas);
        myEle.setAttribute('class', myEleClas);
        myEle.setAttribute('isEditOn',0);
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
      userInDate.value = '';
    }

    function closeInputTask () {
      inputTask.style.display = "none";
      userInTask.value = '';
      userInDate.value = '';
      isAddOn = false;
    }

    document.getElementById('addTask-button').addEventListener('click', function () {
      if (!isAddOn && taskCount < 6) {
          inputTask.style.display = "block";      
          userInTask.focus();
          isAddOn = true;
      }
    });

    document.getElementById('confirm-button').onclick = function () {
      if (isAddOn && userInTask.value) {
        addTask();
        taskCount++;
        closeInputTask();
      }
    };

    document.getElementById('cancel-button').onclick = function () {
      if (isAddOn) {     
        closeInputTask();
      }
    };
  }

  toDoList();
});