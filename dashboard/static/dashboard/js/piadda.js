const DataLength = 100;
var graphicId = 0;
var svgElements = {};
var lastLegend = [];

const compareArrays = (a, b) =>
  a.length === b.length &&
  a.every((element, index) => element === b[index]);


function highestValue(data) {
  return data.reduce((previous, current) => {
    return current.value > previous.value ? current.value : previous.value;
  })
}

function lowestValue(data) {
  return data.reduce((previous, current) => {
    return current.value < previous.value ? current.value : previous.value;
  })
}

function addGraphic(graphicType, key) {
  let _card = `<div class="mb-3">`;
  _card += `<div class="card">`;
  _card += `<div class="card-header">` + graphicType + `</div>`;
  _card += `<div class="card-body" id="` + key + `"> </div>`;
  _card += `</div>`;
  _card += `</div>`;
  $("#graphics").append(_card);
  createSvg("#" + key);
}

function processForm(graphicType) {
  topics = {};
  switch (graphicType) {
    case 'map':
      addMap();
      break;
    case 'series':
      addTimeSeries()
      break;
  }
}
function getXField(inputsSelected) {
  // try search field with name 'x'
  maybe_x = inputsSelected.filter(inputElement => inputElement.value == 'x');
  if (maybe_x.length == 1) {
    return $(maybe_x[0]).val();
  }
  return $(inputsSelected[0]).val();
}

function getYField(inputsSelected) {
  // try search field with name 'y'
  maybe_y = inputsSelected.filter(inputElement => inputElement.value == 'y');
  if (maybe_y.length == 1) {
    return $(maybe_y[0]).val();
  }
  return $(inputsSelected[1]).val();
}

function addMap() {
  let checkedElements = $('.topic-check-input:checkbox:checked');
  if (checkedElements.length > 2) {
    console.log('Mapa deve ter apenas duas variáveis')
    return
  }
  let firstSelected = $(checkedElements[0]);
  let topic_name = firstSelected.attr('data-topic');
  let msg_type = firstSelected.attr('data-msg-type');
  let tkey = topic_name + msg_type;
  topics[tkey] = {};
  topics[tkey]['name'] = topic_name;
  topics[tkey]['period'] = 0.1
  topics[tkey]['element_id'] = "graph" + graphicId;
  topics[tkey]['graphic_type'] = 'map';
  topics[tkey]['msg_type'] = msg_type;
  topics[tkey]['x'] = getXField(checkedElements);
  topics[tkey]['y'] = getYField(checkedElements);
  addGraphic(msg_type, topics[tkey]['element_id'])
  graphicId++;
  for (const [key, value] of Object.entries(topics)) {
    let data = [];
    data.push(value);
    let element = "#" + topics[key]['element_id'];
    // when socket get ready, send a message to backend
    svgElements[element]["socket"].onopen = function () {
      svgElements[element]["socket"].send(JSON.stringify(data));
    }
  }
}

function addTimeSeries() {
  $('.topic-check-input:checkbox:checked').each(function () {
    let topic_name = $(this).attr('data-topic');
    let msg_type = $(this).attr('data-msg-type');
    let field = $(this).val();
    let tkey = topic_name + msg_type;
    if (tkey in topics) {
      topics[tkey]['fields'].push(field);
    } else {
      topics[tkey] = {};
      topics[tkey]['name'] = topic_name;
      topics[tkey]['period'] = 0.2
      topics[tkey]['element_id'] = "graph" + graphicId;
      topics[tkey]['graphic_type'] = 'series';
      topics[tkey]['msg_type'] = msg_type;
      topics[tkey]['fields'] = [];
      topics[tkey]['fields'].push(field);
      addGraphic(msg_type, topics[tkey]['element_id'])
      graphicId++;
    }
  })
  for (const [key, value] of Object.entries(topics)) {
    let data = [];
    data.push(value);
    let element = "#" + topics[key]['element_id'];
    // when socket get ready, send a message to backend
    svgElements[element]["socket"].onopen = function () {
      svgElements[element]["socket"].send(JSON.stringify(data));
    }
  }
}

// concat all dict values into a single array
function unwrapValues(ds) {
  let data = [];
  for (const [key, value] of Object.entries(ds)) {
    data = data.concat(value);
  }
  return data;
}

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

function createSvg(element) {
  svgElements[element] = {}
  svgElements[element]["data"] = {}
  svgElements[element]["xMin"] = Number.POSITIVE_INFINITY;
  svgElements[element]["yMin"] = Number.POSITIVE_INFINITY;
  svgElements[element]["xMax"] = Number.NEGATIVE_INFINITY;
  svgElements[element]["yMax"] = Number.NEGATIVE_INFINITY;
  // append the svg object to the div "element"
  svgElements[element]["svg"] = d3.select(element)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  let data = [{ "ts": 0, "value": 0 }, { "ts": 1, "value": 1 }];
  // Add X axis --> it is a date format
  svgElements[element]["xAxis"] = d3.scaleLinear()
    .domain(d3.extent(data, function (d) { return d.ts; }))
    .range([0, width]);
  let x = svgElements[element]["xAxis"];
  svgElements[element]["svg"].append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5));

  // Add Y axis
  svgElements[element]["yAxis"] = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return +d.value; })])
    .range([height, 0]);
  let y = svgElements[element]["yAxis"];
  svgElements[element]["svg"].append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
  // create a websocket
  svgElements[element]["socket"] = new WebSocket("ws://localhost:8000/ws/dashboard_data/");
  // process every new message received
  svgElements[element]["socket"].onmessage = function (event) {
    let data = JSON.parse(event.data);
    let element = "#" + data.element;
    pushData(data, svgElements[element]["data"]);
    let dataset = svgElements[element]["data"];
    switch (data.graphic_type) {
      case 'map':
        drawMap(element, unwrapValues(dataset));
        break;
      case 'series':
        drawLines(element, unwrapValues(dataset));
        break;
    }
  };
}

function drawLines(element, data) {
  var svg = svgElements[element]["svg"];
  var x = svgElements[element]["xAxis"];
  var y = svgElements[element]["yAxis"];
  // update xAxis and yAxis
  x.domain(d3.extent(data, function (d) { return d.ts; }));
  y.domain([Math.min(0, d3.min(data, function (d) { return d.value; })), d3.max(data, function (d) { return d.value; }) + 2])

  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function (d) { return d.name; })
    .entries(data);

  // color palette
  var res = sumstat.map(function (d) { return d.key }) // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])

  svg.selectAll(".line").remove();

  // Draw the line
  svg.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", function (d) { return color(d.key) })
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3.line()
        .x(function (d) { return x(d.ts); })
        .y(function (d) { return y(+d.value); })
        (d.values)
    })
  // update the x-axis
  svg.select('.x-axis').call(d3.axisBottom(x));

  // update the y-axis
  svg.select('.y-axis').call(d3.axisLeft(y));

  // update legend
  if (!compareArrays(res, lastLegend)) {
    lastLegend = res;
    if (res.length > 1) {
      var longest = res.reduce(
        function (a, b) {
          return a.length > b.length ? a.length : b.length;
        }
      );
    } else {
      var longest = res[0].length;
    }
    var legendItemSize = 12;
    var legendSpacing = 4;
    var xOffset = 350 - longest * 5;
    var yOffset = 0;
    // cleaning
    svg.selectAll('.legendItem').remove();
    svg.selectAll('.legendText').remove();
    var legend = svg.selectAll('.legendItem')
      .data(sumstat);
    legend
      .enter()
      .append('rect')
      .attr('class', 'legendItem')
      .attr('width', legendItemSize)
      .attr('height', legendItemSize)
      .style('fill', function (d) { return color(d.key) })
      .attr('transform',
        (d, i) => {
          var x = xOffset;
          var y = yOffset + (legendItemSize + legendSpacing) * i;
          return `translate(${x}, ${y})`;
        });

    //Create legend labels
    legend
      .enter()
      .append('text')
      .attr('class', 'legendText')
      .attr('x', xOffset + legendItemSize + 5)
      .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
      .text(d => d.key);
  }
}



function drawMap(element, data) {
  var svg = svgElements[element]["svg"];
  var x = svgElements[element]["xAxis"];
  var y = svgElements[element]["yAxis"];
  let xMin = svgElements[element]["xMin"];
  let yMin = svgElements[element]["yMin"];
  let xMax = svgElements[element]["xMax"];
  let yMax = svgElements[element]["yMax"];
  // color palette
  let line_color = '#e41a1c'; //'#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'
  if (data.length > 2) {
    let x_data = data.map(function (d) { return d.x });
    let y_data = data.map(function (d) { return d.y });
    xMax = Math.max(xMax, Math.max(...x_data) + 2);
    yMax = Math.max(yMax, Math.max(...y_data) + 2);
    xMin = Math.min(xMin, Math.min(...x_data) - 2);
    yMin = Math.min(yMin, Math.min(...y_data) - 2);
    svgElements[element]["xMax"] = xMax;
    svgElements[element]["yMax"] = yMax;
    svgElements[element]["xMin"] = xMin;
    svgElements[element]["yMin"] = yMin;
    // update xAxis and yAxis
    if (!compareArrays(x.domain(), [xMin, xMax])) {
      x.domain([xMin, xMax])
    }
    if (!compareArrays(y.domain(), [yMin, yMax])) {
      y.domain([yMin, yMax])
    }

    svg.selectAll(".line").remove();
    // Draw the line
    var line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
    svg.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", line_color)
      .attr("stroke-width", 1.5)
      .attr("d", line(data))
    // update the x-axis
    svg.select('.x-axis').call(d3.axisBottom(x));
    // update the y-axis
    svg.select('.y-axis').call(d3.axisLeft(y));
  }
}

function pushData(data, dataset) {
  if (data.name in dataset) {
    if (dataset[data.name].length >= DataLength) {
      dataset[data.name].shift()
    }
    dataset[data.name].push(data)
  } else {
    dataset[data.name] = []
    dataset[data.name].push(data)
  }
}

