"use strict";


const CronJob = require('cron').CronJob;
const fs = require('fs');
require('dotenv').config()
const nodemailer = require("nodemailer");
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
    let currentTime = d.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
    let info = await transporter.sendMail({
        from: '"Ankur Paul 👻" <suryashi2013@gmail.com>', // sender address
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

var job = new CronJob('* * * * *', async () => {
    console.log('------- JOB STARTED (ITERATING IN 1 MINUTE) 🚀 ------- ')
    mailSender().catch(console.error);
}, null, true, 'Asia/Kolkata');

job.start();