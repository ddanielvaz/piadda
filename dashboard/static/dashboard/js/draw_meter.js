function addMeter(options) {
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
    addMeterElement(msg_type, element_id, options)
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

function addMeterElement(msgType, key, options) {
    let _card = `<div class="mb-3">`;
    _card += `<div class="card">`;
    _card += `<div class="card-header"><div class="row">`;
    _card += '<div class="col-auto me-auto">' + msgType + ' - ' + key + '</div>';
    _card += '<div class="col-auto" id="lslHeader' + key + '"> </div>';
    _card += '<div class="col-auto" id="uslHeader' + key + '"> </div>';
    _card += `</div></div>`;
    _card += `<div class="card-body" id="` + key + `"> </div>`;
    _card += `</div>`;
    _card += `</div>`;
    $("#graphics").append(_card);
    createSvg("#" + key, options);
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
            let USL = svgElements[element]["usl"]
            let LSL = svgElements[element]["lsl"]
            xMin = Math.min(xMin, USL);
            xMin = Math.min(xMin, LSL);
            xMax = Math.max(xMax, USL);
            xMax = Math.max(xMax, LSL);
            specs.push({ 'name': 'LSL', 'color': '#ff0000', 'values': [{ 'x': LSL, 'y': 0.0 }, { 'x': LSL, 'y': 1.0 }] })
            specs.push({ 'name': 'USL', 'color': '#00ff00', 'values': [{ 'x': USL, 'y': 0.0 }, { 'x': USL, 'y': 1.0 }] })
            let sufix = element.replace('#', '')
            let greaterThanUSL = x_data.filter(d => d > USL)
            let lessThanLSL = x_data.filter(d => d < LSL)
            if (greaterThanUSL.length) {
                $('#uslHeader' + sufix).attr('style', 'background-color:#00ff00')
            } else {
                $('#uslHeader' + sufix).attr('style', 'display:none')
            }
            if (lessThanLSL.length) {
                $('#lslHeader' + sufix).attr('style', 'background-color:#ff0000')
            } else {
                $('#lslHeader' + sufix).attr('style', 'display:none')
            }
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
