// First I want to read the file
const fs = require('fs')

const text = fs.readFileSync('./pincodes.csv', 'utf8')
const pincodes = text.trim().split(",");

module.exports= pincodes;