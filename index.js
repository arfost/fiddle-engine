const path = require('path')

const fs = require('fs');
try {
    const log_file = fs.createWriteStream(path.join(__dirname, 'debug.log'), {
        flags: 'w'
    });
    console.log = function (...d) { //
        if (d && d.includes && d.includes('ScreenMap'))
            return
        log_file.write(JSON.stringify(d, null, 4) + '\n');
    };
} catch (e) {
    console.log = function (...d) {};
}

require('./fiddle-launcher.js')