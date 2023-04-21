function createMapModal(svgElements, elementId) {
    $(elementId).contextmenu(function () {
        if (svgElements[elementId]["setupModal"]) {
            svgElements[elementId]["setupModal"].show()
        } else {
            let mapModal = document.getElementById('setupMapModal')
            let modalTitle = mapModal.querySelector('.modal-title')
            let pauseButton = mapModal.querySelector('.btn-pause')
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            modalTitle.textContent = 'Setup Map ' + elementId
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(mapModal, {})
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
            let timeSeriesModal = document.getElementById('setupTimeSeriesModal')
            let modalTitle = timeSeriesModal.querySelector('.modal-title')
            let pauseButton = timeSeriesModal.querySelector('.btn-pause')
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            modalTitle.textContent = 'Setup Time Series ' + elementId
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(timeSeriesModal, {})
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
            let meterModal = document.getElementById('setupMeterModal')
            let modalTitle = meterModal.querySelector('.modal-title')
            let pauseButton = meterModal.querySelector('.btn-pause')
            $(pauseButton).on('click', function () {
                let data = { 'subscriber': svgElements[elementId]["pythonSubscriber"], 'cmd': 'pause' }
                svgElements[elementId]["socket"].send(JSON.stringify(data))
            })
            modalTitle.textContent = 'Setup Meter ' + elementId
            svgElements[elementId]["setupModal"] = new bootstrap.Modal(meterModal, {})
            svgElements[elementId]["setupModal"].show();
        }
        return false
    });
}
