const fs = require('fs')

const get = () => {
    const dataPrepare = require('./dataPrepare');
    setTimeout(() => {
        const mailBody = dataPrepare.masterRecord;

        console.log('mailBody', mailBody);

        if (Object.keys(mailBody).length !== 0)
            fs.writeFileSync('./output.json', JSON.stringify(mailBody), () => console.log('WRITTEN TO FILE'))
    }, 3000)

}

get();