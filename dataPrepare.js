const csvparsed = require('./csvparser');

const axios = require('axios')

const masterRecord = {};

const apiFetch = async () => {
    try {
        const obj = new Date();
        for (const pin of csvparsed) {
            const apiEndpoint = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${obj.getDate()}-${obj.getMonth() + 1}-${obj.getFullYear()}`
            const {data} = await axios.get(apiEndpoint);
            // console.log(data)
            const dataHolder = [];
            for (const [index, {name, center_id, sessions}] of data.centers.entries()) {
                const info = [];

                for (const {available_capacity, date} of sessions) {
                    if (available_capacity > 0) {
                        info.push({name, date, available_capacity});
                        // masterRecord.push({name, info: {date, available_capacity}});
                    }
                    // console.log(`AVAILABLE `, available_capacity, ' ON ', date)
                }
                if (info.length > 0)
                    dataHolder.push({name, info})
            }
            if (dataHolder.length > 0)
                masterRecord[pin] = dataHolder
        }
        return masterRecord;
        // console.log(masterRecord)
    } catch (e) {
        console.error(e)
    }
}
apiFetch().then(r => {
});
module.exports = {masterRecord};