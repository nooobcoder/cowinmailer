"use strict";


const CronJob = require('cron').CronJob;
const fs = require('fs');
const axios = require('axios');
require('dotenv').config()
const nodemailer = require("nodemailer");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const mailSender = async () => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD,
        }
    });

    const dataPrepare = require('./dataPrepare');
    const mailBody = await dataPrepare.apiFetch();
    console.log('Mail Body', mailBody);

    if (Object.keys(mailBody).length === 0) {
        return;
    }
    if (Object.keys(mailBody).length !== 0) {
        fs.writeFile('./output.json', JSON.stringify(mailBody), () => console.log('WRITTEN TO FILE'))
        await writeDataToCSV(mailBody);
    }

    const data = fs.readFileSync('./recipients.txt', 'utf8');
    if (data === '') {
        console.error('NO EMAILS SPECIFIED, please specify email addresses in recipients.txt\nWith emails like, ankurpaulin2019@gmail.com, bpaul@lntecc.com')
        process.exit(0);
    }
    // send mail with defined transport object
    let d = new Date()
    let currentHour = d.getHours();

    if (currentHour >= 1 && currentHour <= 7) // Send ALEXA notification only during day time. 7 AM to 12:59 AM
    {
        console.log(`IT IS NIGHT 😪 DID NOT SEND NOTIFICATION TO ALEXA!`)
    } else {
        const districts = dataPrepare.getCenterNames();
        const totalDistricts = districts.length;
        let otherLocations = '';
        // const
        for (const [index, district] of districts.entries()) {
            const shorten = district.split(" ")[0] + district.split(" ")[1]; // Taking first two words
            if (totalDistricts > 3 && index >= 3) {
                otherLocations = otherLocations.concat(' and few other locations.');
                break;
            } else {
                otherLocations = otherLocations.concat(`${shorten}, `);
            }
        }
        if (otherLocations.length > 0) {
            await sendAlexaNotification(otherLocations);
            console.log(`SENT NOTIFICATION TO REGISTERED ALEXA DEVICE!`)
        }
    }

    let currentTime = d.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata'
    });
    let info = await transporter.sendMail({
        from: '"Suryashi IT 🖥" <suryashi2013@gmail.com>', // sender address
        to: `${data.toString()}`, // list of receivers
        subject: `💉 CoWin Vaccines Available - ${currentTime}`, // Subject line
        // text: JSON.stringify(mailBody, null, '\t'), // plain text body
        html: "<h1>Hi, Vaccines are available in your area 🚑. Please check the attachment 🖇 to this email for more information!</h1>", // html body
        attachments: [{
            filename: 'Vaccine Information.csv',
            path: './output.csv',
            contentType: 'application/vnd.ms-excel',
            // contentType: 'application/json'
        }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

const pinCodeToDistrict = (obj) => {
    const items = new Set(); // Set to avoid duplicate entries
    for (const area in obj)
        items.add(pincodeDirectory.lookup(area)[0].districtName);
    return [...items];
}

const writeDataToCSV = async (mailBody) => {
    const csvWriter = createCsvWriter({
        append: false,
        path: './output.csv',
        header: [{
            id: 'pincode',
            title: 'PIN'
        }, {
            id: 'date',
            title: 'DATE'
        }, {
            id: 'name',
            title: 'CENTER NAME'
        }, {
            id: 'vacancy',
            title: 'VACANCY'
        }, {
            id: 'vacancydose1',
            title: 'VACANCY DOSE 1'
        }, {
            id: 'vacancydose2',
            title: 'VACANCY DOSE 2'
        }, {
            id: 'min_age',
            title: 'MINIMUM AGE'
        }, {
            id: 'vaccine',
            title: 'VACCINE'
        }, {
            id: 'fee',
            title: 'FEE TYPE'
        },]
    });

    const records = [];
    for (const pin in mailBody) {
        for (const {
            info,
            name,
            fee_type
        }
            of mailBody[pin]) {
            for (const {
                date,
                min_age,
                vaccine,
                available_capacity,
                available_capacity_dose1,
                available_capacity_dose2
            }
                of info) {
                records.push({
                    pincode: pin,
                    date,
                    name,
                    vacancy: available_capacity,
                    vacancydose1: available_capacity_dose1,
                    vacancydose2: available_capacity_dose2,
                    min_age,
                    vaccine,
                    fee: fee_type
                })
                console.log(pin, date, name, available_capacity, available_capacity_dose1, available_capacity_dose2, min_age, vaccine, fee_type);
            }
        }
    }

    csvWriter.writeRecords(records) // returns a promise
        .then(() => {
            console.log('[ WRITTEN CSV FILE ]');
        });
}

const sendAlexaNotification = async (places) => {

    const token = process.env.ALEXA_TOKEN;
    const buildMessage = encodeURIComponent(`Vaccination available in ${places}. Check email for more information.`);
    const apiUrl = `https://api.notifymyecho.com/v1/NotifyMe?notification=${buildMessage}&accessCode=${token}`;
    try {
        await axios.post(apiUrl);
    } catch (e) {
        console.error(e);
    }
}

const minutes = 20;
const job = new CronJob(`*/${minutes} * * * *`, async () => {
    console.log(`------- JOB STARTED (ITERATING IN ${minutes} MINUTE(S)) 🚀 -------\n`)
    await mailSender().catch(console.error);
    console.log(`\n----------- JOB DONE ✅ -----------`)
}, null, true, 'Asia/Kolkata');

job.start();