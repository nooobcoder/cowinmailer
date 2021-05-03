"use strict";


const CronJob = require('cron').CronJob;
const fs = require('fs');
const axios = require('axios');
require('dotenv').config()
const nodemailer = require("nodemailer");
var pincodeDirectory = require('india-pincode-lookup');

const dataPrepare = require('./dataPrepare');


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

    const mailBody = dataPrepare.masterRecord;
    console.log(mailBody);

    if (Object.keys(mailBody).length === 0) {
        return;
    }

    const data = fs.readFileSync('./recipients.txt', 'utf8');
    if (data === '') {
        console.error('NO EMAILS SPECIFIED, please specify email addresses in recipients.txt\nWith emails like, ankurpaulin2019@gmail.com, bpaul@lntecc.com')
        process.exit(0);
    }
    // send mail with defined transport object
    let d = new Date()
    let currentHour = d.getHours();

    if (!(currentHour >= 1 && currentHour <= 7)) // Send ALEXA notification only during day time. 7 AM to 12:59 AM
    {
        const districts = pinCodeToDistrict(dataPrepare.masterRecord);
        const totalDistricts = districts.length;
        let otherLocations = '';
        // const
        for (const [index, district] of districts.entries()) {
            const shorten = district.split(" ")[0];
            if (totalDistricts > 3 && index >= 3) {
                otherLocations = otherLocations.concat(' and few other locations.');
                break;
            } else {
                otherLocations = otherLocations.concat(`${shorten}, `);
            }
        }
        await sendAlexaNotification(otherLocations);
        console.log(`SENT NOTIFICATION TO REGISTERED ALEXA DEVICE!`)
    } else {
        console.log(`IT IS NIGHT 😪 DID NOT SEND NOTIFICATION TO ALEXA!`)
    }

    let currentTime = d.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    let info = await transporter.sendMail({
        from: '"Suryashi IT 🖥" <suryashi2013@gmail.com>', // sender address
        to: `${data.toString()}`, // list of receivers
        subject: `💉 CoWin Vaccines Available - ${currentTime}`, // Subject line
        text: JSON.stringify(mailBody, null, '\t'), // plain text body

        // html: "<h1>Hi!</h1>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

const pinCodeToDistrict = (obj) => {
    console.log(obj)
    const items = new Set(); // Set to avoid duplicate entries
    for (const area in obj)
        items.add(pincodeDirectory.lookup(area)[0].districtName);
    return [...items];
}

const sendAlexaNotification = async (places) => {

    const token = process.env.ALEXA_TOKEN;
    const buildMessage = encodeURIComponent(`Vaccination available in ${places}. Check email for more information.`);
    console.log(buildMessage);
    const apiUrl = `https://api.notifymyecho.com/v1/NotifyMe?notification=${buildMessage}&accessCode=${token}`;
    try {
        await axios.post(apiUrl);
    } catch (e) {
        console.error(e);
    }
}

const job = new CronJob('*/10 * * * *', async () => {
    console.log('------- JOB STARTED (ITERATING IN 1 MINUTE) 🚀 ------- ')
    mailSender().catch(console.error);
}, null, true, 'Asia/Kolkata');

job.start();