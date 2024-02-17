const fs = require('fs');
const defaultDir = './dist/win-ia32-unpacked/resources/default_app'
const exeFile = './dist/win-ia32-unpacked/MqClient.exe'

exports.default = function() {
  // remove leftover files from default electron app
  fs.rm(defaultDir, { recursive: true }, (err) => {
    if (err) {
        throw err;
    }
  });
  // patch executable for large address awareness
  fs.open(exeFile, "r+", (err, fd) => {
    if(!err) {
        fs.write(
            fd, new Uint8Array([0x22]), 0, 1, 0x166,
            (err) => {
                if(err) {
                    throw err;
                }
                fs.closeSync(fd);
            }
        );
    } else {
        throw err;
    }
  });
}
