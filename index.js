const path = require('path')

const fs = require('fs');
// const log_file = fs.createWriteStream(path.join(__dirname, 'debug.log'), {
//     flags: 'w'
// });
console.log = function (...d) { //
    //log_file.write(JSON.stringify(d, null, 4) + '\n');
    fs.appendFileSync(path.join(__dirname, 'debug.log'), JSON.stringify(d, null, 4) + '\n')
};


require('./fiddle-launcher.js')