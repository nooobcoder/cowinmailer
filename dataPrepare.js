const csvparsed = require('./csvparser');

const axios = require('axios')
const UserAgent = require('user-agents'); // DOCS: https://www.npmjs.com/package/user-agents


const masterRecord = {};
const center_names = [];

const apiFetch = async() => {
    try {
        let config = {
            method: 'get',
            headers: {
                'accept': 'application/json',
                'Accept-Language': 'hi_IN',
                "cache-control": "max-age=0",
            }
        }

        // UPDATE: The new CoWin API requires a User-Agent parameter to be passed everytime.
        // Generating random user agents

        const obj = new Date();
        let MyDateString;

        obj.setDate(obj.getDate());

        MyDateString = ('0' + obj.getDate()).slice(-2) + '-' + ('0' + (obj.getMonth() + 1)).slice(-2) + '-' + obj.getFullYear();

        console.log('[API HIT]')
        console.log(`[ DATE API ] : ${MyDateString}`)
        for (const pin of csvparsed) {
            const userAgent = new UserAgent(); // Generating user agents for mobile devices only to prevent blocking
            // const userAgent = new UserAgent({deviceCategory:'mobile'});  // Generating user agents for mobile devices only to prevent blocking
            config.headers['User-Agent'] = userAgent.data.userAgent;
            const apiEndpoint = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin}&date=${MyDateString}`
            const {
                data
            } = await axios.get(apiEndpoint, config);

            // console.log(data)
            const dataHolder = [];
            for (const [index, {
                    name,
                    center_id,
                    fee_type,
                    sessions
                }] of data.centers.entries()) {
                const info = [];
                // console.log(sessions)

                for (const {
                        available_capacity,
                        available_capacity_dose1,
                        available_capacity_dose2,
                        date,
                        vaccine,
                        min_age_limit
                    }
                    of sessions) {
                    if (available_capacity > 0) {
                        info.push({
                            name,
                            date,
                            min_age: min_age_limit,
                            vaccine,
                            available_capacity,
                            available_capacity_dose1,
                            available_capacity_dose2
                        });
                        // masterRecord.push({name, info: {date, available_capacity}});
                    }
                    // console.log(`AVAILABLE `, available_capacity, ' ON ', date)
                }
                if (info.length > 0) {
                    dataHolder.push({
                        name,
                        fee_type,
                        info
                    })
                    center_names.push(name.split(' ').slice(0, 2).join(' '))
                }
            }
            if (dataHolder.length > 0)
                masterRecord[pin] = dataHolder
        }
        // console.log(masterRecord)
        return masterRecord;
    } catch (e) {
        console.error(e)
        return {};
    }
}

const getCenterNames = () => {
    const items = new Set(); // Set to avoid duplicate entries
    for (const area of center_names) {
        items.add(area);
    }
    return [...items];
};

module.exports = {
    apiFetch,
    getCenterNames
};