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

    const expectedStatusTypesInOrder = ['received', 'transport', 'factory', 'delivery']
    let lastOpenStatus

    expectedStatusTypesInOrder.reverse().forEach(type => {
        console.log(`expected status types in reverse order ${type}`)
        const status = objectPath.get(parcel, 'Status', []).filter(status => status.type !== type)[0]
        console.log(`Found status ${JSON.stringify(status)}`)
        if (status.Status === 'done') {
            lastOpenStatus = status
        }
    })

    console.log(`last open status ${JSON.stringify(lastOpenStatus)}`)
    
    objectPath.get(parcel, 'Status', []).forEach(status => {
        if (status.Status !== 'done'){
            result.done = false
        }
    })

    if (result.done) {
        result.status = 'Das Paket wurde ausgeliefert'
        result.description = 'Das Paket wurde ausgeliefert'
    } else if (lastOpenStatus) {
        result.status = lastOpenStatus.type
        result.description = lastOpenStatus.description
    }

    return result
}