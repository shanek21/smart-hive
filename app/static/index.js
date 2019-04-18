window.onload = function() {
  loadData();
};

function loadData() {
  // console.log("load data");

  // send get request
  var xhr = new XMLHttpRequest();
  let url = '/get-data/'
  xhr.open('GET', url);
  xhr.onload = function () {
    // after the response
    console.log("data loaded");
    // console.log(this.responseText);
    parseData(this.responseText)

  };
  xhr.send()
}

function parseData(dataString){
  // console.log(dataString);
  dataString = dataString.replace(/'/g, '"');
  // console.log(dataString);
  let dataJSON = JSON.parse(dataString);
  // console.log(dataJSON["data"][0]["value"]);

  createWeightSVG(dataJSON)



}

function createWeightSVG(data){
  let window_width = $(window).width();
  $('#weight-svg').attr("width", window_width*0.8).attr("height", 500);

  $( window ).resize(function() {
    createWeightSVG(data);
  });

}
