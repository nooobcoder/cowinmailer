const csvparsed = require('./csvparser');

const axios = require('axios')
const pincodeDirectory = require('india-pincode-lookup');

const masterRecord = {};
const center_names = [];

const apiFetch = async () => {
    try {
        const obj = new Date();
        console.log('[API HIT]')
        console.log(`[ DATE API ] : ${obj.getDate()}-${obj.getMonth() + 1}-${obj.getFullYear()}`)
        for (const pin of csvparsed) {
            const apiEndpoint = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${obj.getDate()}-${obj.getMonth() + 1}-${obj.getFullYear()}`
            const {data} = await axios.get(apiEndpoint);
            // console.log(data)
            const dataHolder = [];
            for (const [index, {name, center_id, fee_type, sessions}] of data.centers.entries()) {
                const info = [];
                // console.log(sessions)

                for (const {available_capacity, date, vaccine, min_age_limit} of sessions) {
                    if (available_capacity > 0) {
                        info.push({name, date, min_age: min_age_limit, vaccine, available_capacity,});
                        // masterRecord.push({name, info: {date, available_capacity}});
                    }
                    // console.log(`AVAILABLE `, available_capacity, ' ON ', date)
                }
                if (info.length > 0) {
                    dataHolder.push({name, fee_type, info})
                    center_names.push(name.split(' ').slice(0, 2).join(' '))
                }
            }
            if (dataHolder.length > 0)
                masterRecord[pin] = dataHolder
        }
        return masterRecord;
        // console.log(masterRecord)
    } catch (e) {
        console.error(e)
        return {};
    }
}

const getCenterNames = () => {
    console.log(center_names)
    const items = new Set(); // Set to avoid duplicate entries
    for (const area of center_names) {
        items.add(area);
    }
    return [...items];
};

module.exports = {apiFetch, getCenterNames};
