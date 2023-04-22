const DataLength = 100;
var graphicId = 0;
var svgElements = {};

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

function sendPing(element) {
  let ws = svgElements[element]["socket"];
  switch (ws.readyState) {
    case WebSocket.OPEN:
      ws.send(JSON.stringify('ping'));
      break;
    case WebSocket.CLOSED:
    case WebSocket.CLOSING:
      clearInterval(svgElements[element]["pingPong"]);
      break;
  }
}

function addGraphic(msgType, key, options) {
  let _card = `<div class="mb-3">`;
  _card += `<div class="card">`;
  _card += `<div class="card-header">` + msgType + ' - ' + key + `</div>`;
  _card += `<div class="card-body" id="` + key + `"> </div>`;
  _card += `</div>`;
  _card += `</div>`;
  $("#graphics").append(_card);
  createSvg("#" + key, options);
}

function processForm(graphicType, options = null) {
  switch (graphicType) {
    case 'map':
      addMap(options);
      break;
    case 'series':
      addTimeSeries(options)
      break;
    case 'meter':
      addMeterGraphic(options);
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

function addMap(options) {
  let topics = {};
  let checkedElements = $('.topic-check-input:checkbox:checked');
  if (checkedElements.length > 2) {
    // FIXME: provide feedback to user/client
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
  addGraphic(msg_type, topics[tkey]['element_id'], options)
  createMapModal(svgElements, "#" + topics[tkey]['element_id'])
  graphicId++;
  for (const [key, value] of Object.entries(topics)) {
    let data = [];
    data.push(value);
    let element = "#" + topics[key]['element_id'];
    svgElements[element]["pythonSubscriber"] = topics[key]["name"] + topics[tkey]['element_id'] + topics[tkey]['graphic_type'];
    // when socket get ready, send a message to backend
    svgElements[element]["socket"].onopen = function () {
      svgElements[element]["socket"].send(JSON.stringify(data));
    }
  }
}

function addTimeSeries(options) {
  let topics = {};
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
    }
  })
  let msg_type = "";
  let element_id;
  let idx = 0;
  for (const k of Object.keys(topics)) {
    // it will be the same for each key
    element_id = topics[k]['element_id'];
    if (idx == 0) {
      msg_type = topics[k]['msg_type'];
      idx++;
      continue;
    }
    msg_type = msg_type.concat("-", topics[k]['msg_type']);
  }
  addGraphic(msg_type, element_id, options)
  createTimeSeriesModal(svgElements, "#" + element_id)
  graphicId++;
  let data = [];
  let element = "#" + element_id;
  for (const [key, value] of Object.entries(topics)) {
    svgElements[element]["lastLegend"] = [];
    svgElements["#" + element_id]["pythonSubscriber"] = value["name"] + value['element_id'] + value['graphic_type'];
    data.push(value);
  }
  // when socket get ready, send a message to backend
  svgElements[element]["socket"].onopen = function () {
    svgElements[element]["socket"].send(JSON.stringify(data));
  }
}

function addMeterGraphic(options) {
  let topics = {};
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
      topics[tkey]['period'] = 0.2;
      topics[tkey]['element_id'] = "graph" + graphicId;
      topics[tkey]['graphic_type'] = 'meter';
      topics[tkey]['msg_type'] = msg_type;
      topics[tkey]['fields'] = [];
      topics[tkey]['fields'].push(field);
    }
  })

  let msg_type = "";
  let element_id;
  let idx = 0;
  for (const k of Object.keys(topics)) {
    // it will be the same for each key
    element_id = topics[k]['element_id'];
    if (idx == 0) {
      msg_type = topics[k]['msg_type'];
      idx++;
      continue;
    }
    msg_type = msg_type.concat("-", topics[k]['msg_type']);
  }
  addGraphic(msg_type, element_id, options)
  createMeterModal(svgElements, "#" + element_id)
  graphicId++;
  let data = [];
  let element = "#" + element_id;
  svgElements[element]["fields"] = []
  for (const [key, value] of Object.entries(topics)) {
    svgElements[element]["fields"] = svgElements[element]["fields"].concat(value['fields']);
    svgElements["#" + element_id]["pythonSubscriber"] = value["name"] + value['element_id'] + value['graphic_type'];
    data.push(value);
  }

  // when socket get ready, send a message to backend
  svgElements[element]["socket"].onopen = function () {
    svgElements[element]["socket"].send(JSON.stringify(data));
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
var _margin = { top: 10, right: 30, bottom: 30, left: 60 },
  __width = 460 - _margin.left - _margin.right,
  __height = 400 - _margin.top - _margin.bottom;

function createSvg(element, params) {
  svgElements[element] = { ...params };
  svgElements[element]["data"] = {};
  svgElements[element]["xMin"] = Number.POSITIVE_INFINITY;
  svgElements[element]["yMin"] = Number.POSITIVE_INFINITY;
  svgElements[element]["xMax"] = Number.NEGATIVE_INFINITY;
  svgElements[element]["yMax"] = Number.NEGATIVE_INFINITY;
  // check for necessary parameters
  if (svgElements[element]["height"] === undefined)
    svgElements[element]["height"] = __height;
  //
  if (svgElements[element]["width"] === undefined)
    svgElements[element]["width"] = __width;
  //
  if (svgElements[element]["maxDataLength"] === undefined)
    svgElements[element]["maxDataLength"] = DataLength;
  let width = svgElements[element]["width"];
  let height = svgElements[element]["height"];
  // append the svg object to the div "element"
  svgElements[element]["svg"] = d3.select(element)
    .append("svg")
    .attr("width", width + _margin.left + _margin.right)
    .attr("height", height + _margin.top + _margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + _margin.left + "," + _margin.top + ")");
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
  if (svgElements[element]["showYAxis"]) {
    let y = svgElements[element]["yAxis"];
    svgElements[element]["svg"].append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  }
  // create a websocket
  svgElements[element]["socket"] = new WebSocket("ws://localhost:8000/ws/dashboard_data/");
  svgElements[element]["pingPong"] = setInterval(sendPing, 15000, element); //15 seconds
  // process every new message received
  svgElements[element]["socket"].onmessage = function (event) {
    let data = JSON.parse(event.data);
    if (data === 'pong') {
      return
    }
    let element = "#" + data.element;
    pushData(data, svgElements[element]["data"], svgElements[element]["maxDataLength"]);
    let dataset = svgElements[element]["data"];
    switch (data.graphic_type) {
      case 'map':
        drawMap(element, unwrapValues(dataset));
        break;
      case 'series':
        drawLines(element, unwrapValues(dataset));
        break;
      case 'meter':
        drawMeter(element, unwrapValues(dataset));
        break;
    }
  };
}

function drawLines(element, data) {
  var svg = svgElements[element]["svg"];
  var x = svgElements[element]["xAxis"];
  var y = svgElements[element]["yAxis"];
  let yMin = svgElements[element]["yMin"];
  let yMax = svgElements[element]["yMax"];
  // update the x-axis
  x.domain(d3.extent(data, function (d) { return d.ts; }));
  svg.select('.x-axis').call(d3.axisBottom(x));
  // check for yMin/yMax
  yMin = Math.min(yMin, d3.min(data, function (d) { return d.value; }) - 2)
  yMax = Math.max(yMax, d3.max(data, function (d) { return d.value; }) + 2);
  svgElements[element]["yMin"] = yMin;
  svgElements[element]["yMax"] = yMax;
  // if needed, update y-axis
  if (!compareArrays(y.domain(), [yMin, yMax])) {
    y.domain([yMin, yMax])
    svg.select('.y-axis').call(d3.axisLeft(y));
  }

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
  // update legend
  let lastLegend = svgElements[element]["lastLegend"];
  if (!compareArrays(res, lastLegend)) {
    svgElements[element]["lastLegend"] = res;
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

function drawMeter(element, data) {
  let svg = svgElements[element]["svg"];
  let x = svgElements[element]["xAxis"];
  let y = svgElements[element]["yAxis"];
  let xMin = svgElements[element]["xMin"];
  let xMax = svgElements[element]["xMax"];

  if (data.length > 2) {
    let bar_data = [];
    // update and get latest data for each "metered" field
    for (const field of svgElements[element]["fields"]) {
      // filter all data for specific field name
      // could return empty array, if field name is not present in time-frame received data
      let aux = data.filter(d => [field].indexOf(d.name) != -1);
      if (aux.length) {
        // get the most recent entry of the array, i.e., largest ts (timestamp)
        // create or update latest data on svgElements dictionary
        svgElements[element]["latest" + field] = aux.sort((a, b) => a.ts - b.ts).slice(-1)[0]
      }
      // use latest data if exists
      if (svgElements[element]["latest" + field] !== undefined) {
        bar_data.push(svgElements[element]["latest" + field]);
      }
    }
    // check if all expected fields exists/were received
    if (bar_data.length != svgElements[element]["fields"].length) {
      // FIXME: Not received yet expected fields from backend. Maybe warn the frontend ???
      // FIXME: the behavior in frontend is a graphic without any values, even if any value has been received (but not all)
      // FIXME: the graph will only be updated from the moment that all fields have been received at least once
      return;
    }
    let names = bar_data.map(d => d.name);
    let x_data = bar_data.map(d => d.value);
    xMax = Math.max(xMax, Math.max(...x_data) + 2);
    xMin = Math.min(xMin, Math.min(...x_data) - 2);
    let specs = [];
    if (svgElements[element]["specLimitsEnabled"]) {
      // update xMin and xMax
      xMin = Math.min(xMin, svgElements[element]["usl"]);
      xMin = Math.min(xMin, svgElements[element]["lsl"]);
      xMax = Math.max(xMax, svgElements[element]["usl"]);
      xMax = Math.max(xMax, svgElements[element]["lsl"]);
      specs.push({ 'name': 'LSL', 'color': '#ff0000', 'values': [{ 'x': svgElements[element]["lsl"], 'y': 0.0 }, { 'x': svgElements[element]["lsl"], 'y': 1.0 }] })
      specs.push({ 'name': 'USL', 'color': '#00ff00', 'values': [{ 'x': svgElements[element]["usl"], 'y': 0.0 }, { 'x': svgElements[element]["usl"], 'y': 1.0 }] })
    }
    svgElements[element]["xMax"] = xMax;
    svgElements[element]["yMax"] = 1.0;
    svgElements[element]["xMin"] = xMin;
    svgElements[element]["yMin"] = 0.0;
    // update xAxis and yAxis
    if (!compareArrays(x.domain(), [xMin, xMax])) {
      x.domain([xMin, xMax]);
      svg.select('.x-axis').call(d3.axisBottom(x));
    }
    if (!compareArrays(y.domain(), [0.0, 1.0])) {
      y.domain([0.0, 1.0]);
      svg.select('.y-axis').call(d3.axisLeft(y));
    }
    const _color = d3.scaleOrdinal(d3.schemeCategory10);
    // Bars
    const fixed_height = Math.abs(y(0.8) - y(0.0)) / bar_data.length;
    svg.selectAll(".mybar").remove();
    svg.selectAll("mybar")
      .data(bar_data)
      .enter()
      .append("rect")
      .attr("class", "mybar")
      .attr("x", function (d) { if (d.value >= 0) return x(0); return x(d.value); })
      .attr("y", function (d) { let k = 1.0 - names.indexOf(d.name) / bar_data.length; return y(k); })
      .attr("width", function (d) { return Math.abs(x(d.value) - x(0)) })
      .attr("height", fixed_height)
      .attr("fill", function (d) { return _color(d.name); });
    // Draw Specification Lines
    if (svgElements[element]["specLimitsEnabled"]) {
      svg.selectAll(".line").remove();
      // Draw the line
      svg.selectAll(".line")
        .data(specs)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function (d) { return d.color; })
        .attr("stroke-width", 1.5)
        .attr("d", function (d) {
          return d3.line()
            .x(function (d) { return x(d.x); })
            .y(function (d) { return y(d.y); })
            (d.values)
        })
    }
    drawMeterLegend(element, bar_data);
  }
}

function drawMeterLegend(element, legend_data) {
  const _color = d3.scaleOrdinal(d3.schemeCategory10);
  let width = 200;
  let legendItemSize = 12;
  let legendSpacing = 4;
  let xOffset = 0;
  let yOffset = _margin.top;
  let height = (legendItemSize + legendSpacing) * legend_data.length;
  if (legend_data && svgElements[element]["legendCreated"] === undefined) {
    svgElements[element]["legendCreated"] = d3.select(element)
      .append("svg")
      .attr("width", width + _margin.left + _margin.right)
      .attr("height", height + _margin.top + _margin.bottom);
    let svg = svgElements[element]["legendCreated"];
    let legend = svg.selectAll('.legendItem').data(legend_data);
    legend.enter()
      .append('rect')
      .attr('class', 'legendItem')
      .attr('width', legendItemSize)
      .attr('height', legendItemSize)
      .style('fill', d => _color(d.name))
      .attr('transform',
        (d, i) => {
          var x = xOffset;
          var y = yOffset + (legendItemSize + legendSpacing) * i;
          return `translate(${x}, ${y})`;
        });

    //Create legend labels
    legend.enter()
      .append('text')
      .attr('x', xOffset + legendItemSize + 5)
      .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
      .text(d => d.name);
  }
  if (svgElements[element]["legendCreated"] !== undefined) {
    let svg = svgElements[element]["legendCreated"];
    svg.selectAll('.legendValues').remove();
    let values = svg.selectAll('.legendValues').data(legend_data);
    values.enter()
      .append('text')
      .attr('class', 'legendValues')
      .attr('x', xOffset + (legendItemSize + 5) * 2)
      .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
      .style('fill', d => _color(d.name))
      .text(d => d.value.toFixed(1));
  }
}

function pushData(data, dataset, maxDataLength) {
  if (data.name in dataset) {
    if (dataset[data.name].length >= maxDataLength) {
      dataset[data.name].shift()
    }
    dataset[data.name].push(data)
  } else {
    dataset[data.name] = []
    dataset[data.name].push(data)
  }
}

