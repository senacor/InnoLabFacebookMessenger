const objectPath = require('object-path')

/**
 * Calculates the current parcel's status based on all status descriptions
 * @param {{Status: [Object]}} parcel 
 * @returns {{done: Boolean, status: String, description: String}}
 */
module.exports = parcel => {
    const result = {
        status: 'Unknown',
        done: true,
        description: 'Unknown'
    }

    if (!objectPath.has(parcel, 'Status') || objectPath.get(parcel, 'Status', []).length <= 0) {
        result.done = false
    }
    
    objectPath.get(parcel, 'Status', []).forEach(status => {
        if (status.Status === 'in_progress' && result.status === 'Unknown') {
            result.status = 'In Auslieferung'
            result.description = status.description
        }

        if (status.Status !== 'done'){
            result.done = false
        }
    })

    if (result.done) {
        result.status = 'Das Paket wurde ausgeliefert'
        result.description = 'Das Paket wurde ausgeliefert'
    }

    return result
}