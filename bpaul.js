"use strict";


const CronJob = require('cron').CronJob;
const fs = require('fs');
const axios = require('axios');
require('dotenv').config()
const nodemailer = require("nodemailer");


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
    if (Object.keys(mailBody).length !== 0)
        fs.writeFileSync('./output.json', JSON.stringify(mailBody), () => console.log('WRITTEN TO FILE'))

    const data = fs.readFileSync('./recipients.txt', 'utf8');
    if (data === '') {
        console.error('NO EMAILS SPECIFIED, please specify email addresses in recipients.txt\nWith emails like, ankurpaulin2019@gmail.com, bpaul@lntecc.com')
        process.exit(0);
    }
    // send mail with defined transport object
    let d = new Date()

    let currentTime = d.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    let info = await transporter.sendMail({
        from: '"Suryashi IT 🖥" <suryashi2013@gmail.com>', // sender address
        to: `${data.toString()}`, // list of receivers
        subject: `💉 CoWin Vaccines Available - ${currentTime}`, // Subject line
        text: JSON.stringify(mailBody, null, '\t'), // plain text body

        // html: "<h1>Hi!</h1>", // html body
        attachments: [{
            filename: 'Output.json',
            path: './output.json',
            contentType: 'application/json'
        }]
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

const minutes = 30;
const job = new CronJob(`*/${minutes} * * * *`, async () => {
    console.log(`------- JOB STARTED (ITERATING IN ${minutes} MINUTE(S)) 🚀 -------\n`)
    await mailSender().catch(console.error);
    console.log(`\n----------- JOB DONE ✅ -----------`)
}, null, true, 'Asia/Kolkata');

job.start();