GLOBAL = {}

window.onload = function() {
  loadData();
};

window.addEventListener("resize", createWeightSVG);

// $( window ).resize(function() {
//   createWeightSVG();
//   $('#weightSVG').remove();
// });

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
  GLOBAL.data = dataJSON;
  GLOBAL.dataLoaded = true;

  createWeightSVG();



}

function createWeightSVG(){
  console.log("create weight svg");
  // remove old viz if recreating
  if ( $( "#weightSVG" ).length ) {
    $( "#weightSVG" ).remove();
  }
  if (GLOBAL.dataLoaded){
    let data = GLOBAL.data;
    let window_width = $(window).width();
    let svg_width = window_width * 0.9;
    let svg_height = 200;
    let weightSVG = d3.select("#content")
      .append("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)
      .attr("id", "weightSVG")
    // $weightSVG.attr("width", svg_width).attr("height", svg_height);



    // setup bounds
    console.log(data);
    let minDate = new Date(data["data"][0]["timestamp"])
    let maxDate = new Date(data["data"][0]["timestamp"])
    let minWeight = data["data"][0]["value"]
    let maxWeight = data["data"][0]["value"]
    weightEntries = {}
    GLOBAL.hives = []
    data["data"].forEach(function(entry){
      let date = new Date(entry.timestamp)
      if (entry.topic == "weight" && date.getHours()==0){
        // console.log(entry);

        let weight = entry.value
        let hiveName = entry.hive_name
        if (weightEntries.hasOwnProperty(hiveName)){
          weightEntries[hiveName].push(entry)
        } else {
          weightEntries[hiveName] = [entry]
          GLOBAL.hives.push(hiveName)
        }

        // console.log(date);
        if (date.getTime() < minDate.getTime()){ minDate = date;}
        if (date.getTime() > maxDate.getTime()){ maxDate = date;}
        if (weight < minWeight){ minWeight = weight;}
        if (weight > maxWeight){ maxWeight = weight;}
      }
    });

    console.log(minDate);
    console.log(maxDate);
    console.log(minWeight);
    console.log(maxWeight);
    console.log(GLOBAL);

    // make axis
    // let $x_axis = $('line').x1(10).y1(10).x2(20).y2(20)
    let x_min = 10;
    let x_max = svg_width-10;
    let y_min = svg_height-10;
    let y_max = 10;
    weightSVG.append("line")
      .attr("x1", x_min)
      .attr("y1", y_min)
      .attr("x2", x_max)
      .attr("y2", y_min)
      .style("stroke", "#999999");
    weightSVG.append("line")
      .attr("x1", x_min)
      .attr("y1", y_min)
      .attr("x2", x_min)
      .attr("y2", y_max)
      .style("stroke", "999999");

    // data["data"].forEach(function(entry){
    //   let date = new Date(entry.timestamp)
    //   if (entry.topic == "weight" && date.getHours()==0){
    GLOBAL.weight = {}
    GLOBAL.hives.forEach(function(hiveName){
      GLOBAL.weight[hiveName] = []
      weightEntries[hiveName].forEach(function(entry){
        let date = new Date(entry.timestamp)
        let weight = entry.value
        let color = '#888'
        let hiveName = entry.hive_name
        if (hiveName == "hive_1"){color = "#3a81a0"};
        // if (entry.topic.includes("hive_2")){color = "8073c2"};
        if (hiveName == "hive_2"){color = "#618c4e"};
        // console.log(date);
        let dataPoint = weightSVG.append("circle")
          .attr("cx", map_range(date.getTime(), minDate.getTime(), maxDate.getTime(), x_min, x_max))
          .attr("cy", map_range(weight, minWeight, maxWeight, y_min, y_max))
          .attr("r", 2)
          .style("fill", color);
        GLOBAL.weight[hiveName].push(dataPoint)
      })
    })
    //     // console.log(entry);
    //     // let date = new Date(entry.timestamp)
    //     let weight = new Date(entry.value)
    //     let color = '#888'
    //     let hiveName = entry.hive_name
    //     if (hiveName == "hive_1"){color = "#3a81a0"};
    //     // if (entry.topic.includes("hive_2")){color = "8073c2"};
    //     if (hiveName == "hive_2"){color = "#618c4e"};
    //     // console.log(date);
    //     let dataPoint = weightSVG.append("circle")
    //       .attr("cx", map_range(date.getTime(), minDate.getTime(), maxDate.getTime(), x_min, x_max))
    //       .attr("cy", map_range(weight, minWeight, maxWeight, y_min, y_max))
    //       .attr("r", 2)
    //       .style("fill", color);
    //
    //   }
    //
    // });
  }

}

function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
