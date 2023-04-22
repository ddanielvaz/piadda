function createMapModal(svgElements, elementId) {
    $(elementId).contextmenu(function () {
        if (svgElements[elementId]["setupModal"]) {
            svgElements[elementId]["setupModal"].show()
        } else {
            let sufix = elementId.replace('#', '_')
            insertMapModal("#main", sufix)
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(document.getElementById('setupMapModal' + sufix), {})
            let mapModal = svgElements[elementId]["setupModal"]._element
            let modalTitle = mapModal.querySelector('.modal-title')
            let pauseButton = mapModal.querySelector('.btn-pause')
            let applyButton = mapModal.querySelector('.btn-apply')
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            $(applyButton).on('click', function () {
                console.log("apply button clicked on: ", elementId)
            })
            modalTitle.textContent = 'Setup Map ' + elementId
            svgElements[elementId]["setupModal"].show();
        }
        return false
    });
}

function createTimeSeriesModal(svgElements, elementId) {
    $(elementId).contextmenu(function () {
        if (svgElements[elementId]["setupModal"]) {
            svgElements[elementId]["setupModal"].show()
        } else {
            let sufix = elementId.replace('#', '_')
            insertTimeSeriesModal("#main", sufix)
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(document.getElementById('setupTimeSeriesModal' + sufix), {})
            let timeSeriesModal = svgElements[elementId]["setupModal"]._element
            let modalTitle = timeSeriesModal.querySelector('.modal-title')
            let pauseButton = timeSeriesModal.querySelector('.btn-pause')
            let applyButton = timeSeriesModal.querySelector('.btn-apply')
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            $(applyButton).on('click', function () {
                console.log("apply button clicked on: ", elementId)
            })
            modalTitle.textContent = 'Setup Time Series ' + elementId
            svgElements[elementId]["setupModal"].show();
        }
        return false
    });
}

function createMeterModal(svgElements, elementId) {
    $(elementId).contextmenu(function () {
        if (svgElements[elementId]["setupModal"]) {
            svgElements[elementId]["setupModal"].show()
        } else {
            let sufix = elementId.replace('#', '_')
            insertMeterModal("#main", sufix)
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(document.getElementById('setupMeterModal' + sufix), {})
            let meterModal = svgElements[elementId]["setupModal"]._element
            let modalTitle = meterModal.querySelector('.modal-title')
            let pauseButton = meterModal.querySelector('.btn-pause')
            let applyButton = meterModal.querySelector('.btn-apply')
            $('#lsl' + sufix).prop('disabled', true)
            $('#usl' + sufix).prop('disabled', true)
            $('#specLimitsEnabled' + sufix).change(function () {
                $('#lsl' + sufix).prop('disabled', !this.checked)
                $('#usl' + sufix).prop('disabled', !this.checked)
            })
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            $(applyButton).on('click', function () {
                svgElements[elementId]['specLimitsEnabled'] = $('#specLimitsEnabled' + sufix).prop('checked')
                svgElements[elementId]['lsl'] = $('#lsl' + sufix).val()
                svgElements[elementId]['usl'] = $('#usl' + sufix).val()
            })
            modalTitle.textContent = 'Setup Meter ' + elementId
            svgElements[elementId]["setupModal"].show();
        }
        return false
    });
}

function insertMeterModal(parentId, elementId) {
    let _modal = '<div class="modal fade" id="setupMeterModal' + elementId + '" tabindex="-1" aria-labelledby="setupMeterModalLabel" aria-hidden="true">'
    _modal += '<div class="modal-dialog">'
    _modal += '<div class="modal-content">'
    _modal += '<div class="modal-header">'
    _modal += '<h5 class="modal-title" id="setupMeterModalLabel">Setup meter</h5>'
    _modal += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
    _modal += '</div>'
    _modal += '<div class="modal-body">'
    _modal += '<div class="form-check">'
    _modal += '<input class="form-check-input" type="checkbox" value="" id="specLimitsEnabled' + elementId + '">'
    _modal += '<label class="form-check-label" for="flexCheckDefault">Enable specification limits</label>'
    _modal += '</div>'
    _modal += '<div class="form-group mb-3">'
    _modal += '<label for="lsl" class="form-label">Lower Specification Limit</label>'
    _modal += '<input type="number" class="form-control" placeholder="LSL" name="lsl" id="lsl' + elementId + '">'
    _modal += '</div>'
    _modal += '<div class="form-group mb-3">'
    _modal += '<label for="usl" class="form-label">Upper Specification Limit</label>'
    _modal += '<input type="number" class="form-control" placeholder="USL" name="usl" id="usl' + elementId + '">'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '<div class="modal-footer">'
    _modal += '<button type="button" class="btn btn-secondary btn-pause">Pause</button>'
    _modal += '<button type="submit" class="btn btn-primary btn-apply" data-bs-dismiss="modal">Apply</button>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    $(parentId).append(_modal)
}

function insertMapModal(parentId, elementId) {
    let _modal = '<div class="modal fade" id="setupMapModal' + elementId + '" tabindex="-1" aria-labelledby="setupMapModalLabel" aria-hidden="true">'
    _modal += '<div class="modal-dialog">'
    _modal += '<div class="modal-content">'
    _modal += '<div class="modal-header">'
    _modal += '<h5 class="modal-title" id="setupMapModalLabel">Setup map</h5>'
    _modal += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
    _modal += '</div>'
    _modal += '<div class="modal-body">'
    _modal += '</div>'
    _modal += '<div class="modal-footer">'
    _modal += '<button type="button" class="btn btn-secondary btn-pause">Pause</button>'
    _modal += '<button type="button" class="btn btn-primary btn-apply" data-bs-dismiss="modal">Apply</button>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    $(parentId).append(_modal)
}

function insertTimeSeriesModal(parentId, elementId) {
    let _modal = '<div class="modal fade" id="setupTimeSeriesModal' + elementId + '" tabindex="-1" aria-labelledby="setupTimeSeriesModalLabel" aria-hidden="true">'
    _modal += '<div class="modal-dialog">'
    _modal += '<div class="modal-content">'
    _modal += '<div class="modal-header">'
    _modal += '<h5 class="modal-title" id="setupTimeSeriesModalLabel">Setup time series</h5>'
    _modal += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
    _modal += '</div>'
    _modal += '<div class="modal-body">'
    _modal += '</div>'
    _modal += '<div class="modal-footer">'
    _modal += '<button type="button" class="btn btn-secondary btn-pause">Pause</button>'
    _modal += '<button type="button" class="btn btn-primary btn-apply" data-bs-dismiss="modal">Apply</button>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    _modal += '</div>'
    $(parentId).append(_modal)
}
