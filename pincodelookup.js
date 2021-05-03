var pincodeDirectory = require('india-pincode-lookup');


const area = pincodeDirectory.lookup(110001)[0].districtName;
console.log(area)
/*[{
    officeName: 'Vennala S.O',
    pincode: 682028,
    taluk: 'Ernakulam',
    districtName: 'Ernakulam',
    stateName: 'KERALA'
    }]*/

for (const a of [1, 2, 3]) {
    console.log(a)
}