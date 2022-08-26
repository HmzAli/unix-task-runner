const fs = require('fs');
const path = require('path')
const { exec } = require("child_process");


const homeDir = require('os').homedir();
const desktopDir = `${homeDir}/Desktop`;

const drawerName = 'Drawer';
const drawerDir = `${desktopDir}/${drawerName}`;
const ignoredFiles = [
    'Drawer',
    '.DS_Store',
    'prod.tavis.key.pem',
    'dev-tavis-pem.pem',
    'RCM',
    'android-stuff',
];

cleanDesktop();

function cleanDesktop() {
    fs.readdir(desktopDir, (err, files) => {
        files.forEach(fileName => {
            if (ignoredFiles.includes(fileName)) {
                return;
            }

            console.log('\n\n --- ', new Date());
            moveFile(getFullPath(fileName, desktopDir), drawerDir)
                .then(() => {
                    console.log(`file ${fileName} successfully moved to ${drawerDir}`);
                })
                .catch(err => {
                    throw err;
                });
        });
    });
}

function moveFile(filePath, targetPath) {
    return new Promise((resolve, reject) => {
        exec(`mv "${filePath}" ${targetPath}`, (err, stdout) => {
            if (err) {
                reject(err);
            }

            resolve(stdout);
        });
    });
}

function getFullPath(fileName, fileDir) {
    return `${fileDir}${path.sep}${fileName}`;
}
