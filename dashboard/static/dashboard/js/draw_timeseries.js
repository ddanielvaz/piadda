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
    addTimeSeriesElement(msg_type, element_id, options)
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

function addTimeSeriesElement(msgType, key, options) {
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
