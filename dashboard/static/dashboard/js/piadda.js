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

function processForm(graphicType, options = null) {
  switch (graphicType) {
    case 'map':
      addMap(options);
      break;
    case 'series':
      addTimeSeries(options)
      break;
    case 'meter':
      addMeter(options);
      break;
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

function removeGraphic(graphicKey) {
  let elementId = '#' + graphicKey;
  let divParent = '#_' + graphicKey;
  if (elementId in svgElements) {
    clearInterval(svgElements[elementId]["pingPong"]);
    svgElements[elementId]["socket"].close()
    delete svgElements[elementId];
  }
  $(divParent).remove()
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

