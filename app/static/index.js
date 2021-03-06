// holds all the global variables to prevent confusion later
GLOBAL = {}

/** When the page loads, load data and set up UI */
window.onload = function() {
  loadData();

  // set up toggling listeners
  $('.collapsible').click(function(){
    if ($(this).hasClass('active')){
      $(this).siblings('.collapsible-content').hide();
      $(this).removeClass('active');
      let text = $(this).html();
      $(this).html('\u{002B}' + text.substring(1, text.length));
      // $(this).html('\u{2571}\u{2572}' + text.substring(1, text.length));
    } else{
      $(this).siblings('.collapsible-content').show();
      $(this).addClass('active');
      let text = $(this).html();
      $(this).html('\u{2212}' + text.substring(1, text.length));
    }
  })
};

/** Resize when resized */
window.addEventListener('resize', createWeightSVG);

/** Get request to get data */
function loadData() {
  // console.log('load data');
  let loading = $('<p>').attr('id', 'loading-weight').html('Loading...');
  $('#hive-weight').append(loading);

  // send get request
  var xhr = new XMLHttpRequest();
  let url = '/get-data/'
  xhr.open('GET', url);
  xhr.onload = function () {

    // after the response
    console.log('data loaded');
    // console.log(this.responseText);
    parseData(this.responseText)

  };
  xhr.send()
}

/** Convert the string from the get request to something usable */
function parseData(dataString){
  // console.log(dataString);
  dataString = dataString.replace(/'/g, '"');
  // console.log(dataString);
  let dataJSON = JSON.parse(dataString);
  // console.log(dataJSON['data'][0]['value']);
  GLOBAL.data = dataJSON;
  GLOBAL.dataLoaded = true;

  createWeightSVG();

}

/** Build the graph to display weight */
function createWeightSVG(){
  console.log('create weight svg');
  // remove old viz if recreating
  if ( $( '#weightSVG' ).length ) {
    $( '#weightSVG' ).remove();
  }
  if (GLOBAL.dataLoaded){
    $( '#loading-weight' ).remove();
    let data = GLOBAL.data;
    let window_width = $('#hive-weight').width();
    let svg_width = window_width * 0.9;
    let svg_height = 200;
    let weightSVG = d3.select('#hive-weight')
      .append('svg')
      .attr('width', svg_width)
      .attr('height', svg_height)
      .attr('id', 'weightSVG')
    let svg_hover = $('<div>')
      .attr('id', 'weight-hover')
      .attr('display', 'none');
    $('#hive-weight').append(svg_hover);

    // setup bounds
    console.log(data);
    let minDate = new Date(data['data'][0]['timestamp'])
    let maxDate = new Date(data['data'][0]['timestamp'])
    let minWeight = data['data'][0]['value']
    let maxWeight = data['data'][0]['value']
    weightEntries = {}
    GLOBAL.hives = []
    data['data'].forEach(function(entry){
      let date = new Date(entry.timestamp)
      // for testing with fake data, reduces the number of points
      if (entry.topic == 'weight' && date.getHours()==0){

        let weight = entry.value
        let hiveName = entry.hive_name
        if (weightEntries.hasOwnProperty(hiveName)){
          weightEntries[hiveName].push(entry)
        } else {
          weightEntries[hiveName] = [entry]
          GLOBAL.hives.push(hiveName)
        }

        if (date.getTime() < minDate.getTime()){ minDate = date;}
        if (date.getTime() > maxDate.getTime()){ maxDate = date;}
        if (weight < minWeight){ minWeight = weight;}
        if (weight > maxWeight){ maxWeight = weight;}
      }
    });

    // make axis and labels
    let x_margin = 50;
    let y_margin = 25;
    let x_min = x_margin;
    let x_max = svg_width-x_margin;
    let y_min = svg_height-y_margin;
    let y_max = y_margin;
    weightSVG.append('line')
      .attr('x1', x_min)
      .attr('y1', y_min)
      .attr('x2', x_max)
      .attr('y2', y_min)
      .style('stroke', '#999999');
    weightSVG.append('line')
      .attr('x1', x_min)
      .attr('y1', y_min)
      .attr('x2', x_min)
      .attr('y2', y_max)
      .style('stroke', '#999999');
    weightSVG.append('text')
      .text(formatDate(minDate))
      .attr('x', x_min)
      .attr('y', y_min + 15)
      .style('fill', '#999999');
    weightSVG.append('text')
      .text(formatDate(maxDate))
      .attr('x', x_max)
      .attr('y', y_min + 15)
      .style('fill', '#999999')
      .attr('text-anchor', 'end')
    weightSVG.append('text')
      .text(Math.round(minWeight) + ' lb')
      .attr('x', x_min - 5)
      .attr('y', y_min)
      .style('fill', '#999999')
      .attr('text-anchor', 'end')
    weightSVG.append('text')
      .text(Math.round(maxWeight) + ' lb')
      .attr('x', x_min - 5)
      .attr('y', y_max)
      .style('fill', '#999999')
      .attr('text-anchor', 'end')

      // create svg elements for data
    let nameLabels = [];
    GLOBAL.weight = {}
    GLOBAL.hives.forEach(function(hiveName){
      GLOBAL.weight[hiveName] = []
      let lastHiveWeight = 0;
      let color = '#888'
      if (hiveName == 'hive_1'){color = '#3a81a0'};
      if (hiveName == 'hive_2'){color = '#618c4e'};

      weightEntries[hiveName].forEach(function(entry){
        let date = new Date(entry.timestamp)
        let weight = entry.value
        let x_pos = mapRange(date.getTime(), minDate.getTime(), maxDate.getTime(), x_min, x_max)
        let y_pos = mapRange(weight, minWeight, maxWeight, y_min, y_max);
        let dataPoint = weightSVG.append('circle')
          .attr('cx', x_pos)
          .attr('cy', y_pos)
          .attr('r', 2)
          .style('fill', color);
        dataPoint.on('mouseover', function(d){
          let $hover = $('#weight-hover');
          let $date = $('<p>').html(formatDateDay(date));
          let $weight = $('<p>').html(Math.round(weight) + ' lb')
          dataPoint.attr('r', 7);
          $hover.append($date);
          $hover.append($('<br>'));
          $hover.append($weight);
          $hover.parent().css({position: 'relative'});
          $hover.css({top: y_pos+47, left: x_pos-18, position:'absolute'});
          $hover.show();
        })
        dataPoint.on('mouseout', function(d){
          dataPoint.attr('r', 2)
          let $hover = $('#weight-hover');
          $hover.empty();
          $hover.hide();
        })
        GLOBAL.weight[hiveName].push(dataPoint)

        lastHiveWeight = weight;
      })
      let nameLabel = weightSVG.append('text')
        .text(hiveName)
        .attr('x', x_max + 5)
        .attr('y', mapRange(lastHiveWeight, minWeight, maxWeight, y_min, y_max))
        .style('fill', color)
        .style('font-weight', 'bold')
      nameLabels.push(nameLabel);
    })

    // sort by vertical order of names
    nameLabels.sort(function(a,b){
      return a.attr('y') - b.attr('y')
    })
    // space out hive names if too close
    for (let n = 1; n < nameLabels.length; n++){
      let prev_y = Number(nameLabels[n-1].attr('y'))
      let current_y = Number(nameLabels[n].attr('y'))
      if (current_y < prev_y+15){
        nameLabels[n].attr('y', prev_y+15);
      }
    }

  }

}

/** Convert a value on one scale to a value on scale 2 */
function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

/** Take a js date and return a nicely formatted Month YYYY */
function formatDate(date) {
  return date.toLocaleString('en-us', { month: 'short' }) + ' ' + date.getFullYear();
}

/** Take a js date and return a nicely formatted DD Month */
function formatDateDay(date) {
  return date.toLocaleString('en-us', { month: 'short' }) + ' ' + date.getDate()// + ' ' + date.getFullYear();
}
