
document.addEventListener('DOMContentLoaded', function() {

  // AJAX GET weather data
  function getRequest(handle) {
    var XHR;
    var location = document.getElementById("weather-loc").value;
    console.log(location);

    function makeRequest(url) {
      XHR = new XMLHttpRequest();
      if (!XHR) {
        console.log('can\'t get data');
        return false;
      }
      XHR.onreadystatechange = function () {
        if (XHR.readyState === XMLHttpRequest.DONE && XHR.status === 200) {
          return handle(JSON.parse(XHR.responseText));
        } else {
          console.log('Error.');
        }
      };
        ;
      XHR.open('GET',url,true);
      XHR.send();
    }
    makeRequest('http://api.openweathermap.org/data/2.5/weather?q=hong+kong&appid=2de143494c0b295cca9337e1e96b00e0');
  }

  getRequest(dispWeather);

  function dispWeather(data) {
    console.log(data['main']['temp']);
    document.getElementById('weather').innerHTML = data['main']['temp'] - 273.15;
  }




});