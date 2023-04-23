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
    addMapElement(msg_type, topics[tkey]['element_id'], options)
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

function addMapElement(msgType, key, options) {
    let _card = '<div class="col mb-3" id="_' + key + '">';
    _card += '<div class="card">';
    _card += '<div class="card-header">';
    _card += '<div class="row">';
    _card += '<div class="col-auto me-auto">' + msgType + ' - ' + key + '</div>';
    _card += `<div class="col-auto"> <button type="button" class="btn-close" aria-label="Close" onclick="removeGraphic('` + key + `')"></button> </div>`;
    _card += '</div>';
    _card += '</div>';
    _card += '<div class="card-body" id="' + key + '"> </div>';
    _card += '</div>';
    _card += '</div>';
    $("#graphics").append(_card);
    createSvg("#" + key, options);
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
    let line_color = '#e41a1c';
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
