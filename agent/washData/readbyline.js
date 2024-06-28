import * as readline from 'node:readline';
import fs from 'node:fs';

const logtype = process.argv[2];

(async () => {
    if (process.argv.length < 3) {
        console.error("Error: must include exactly 1 command line argument");
        return;
    }
    
    if (logtype !== "benign" && logtype !== "exploit") {
        console.error("Error: command line argument must be EITHER 'exploit' or 'benign'");
        return;
    }

    await parseAllFiles();
})();

async function parseAllFiles() {

    const __dirname = new URL('../data/' + logtype, import.meta.url).pathname;
    const files = fs.readdirSync(__dirname).filter(fn => fn.endsWith('.webgateway'));
    const writerStream = fs.createWriteStream('../data/logs_proxy_format_' + logtype + '.log');

    files.forEach(file => {
        console.info("reading file: ", __dirname + "/" + file);
        const readLine = readline.createInterface({
            input: fs.createReadStream(__dirname + "/" + file)
        })

        readLine.on('line', line => {

            if (!(typeof line === "string")) {
                throw new Error('not an instanceof String');
            }
            let exploit = " False"
            if (logtype === "exploit") {
                exploit = " True"
            }
            const labelType = " Set"
            const lb = "\n";
            let str = line;
            str = str + exploit;
            str = str + labelType;
            str = str + lb;
            str = str.replace(/['"]+/g, ''); // remove all quotation marks from files
            str = str.replace(/  +/g, ' ') // change all double spaces to singular ones
            writerStream.write(str);
        })
        readLine.on('error', err => {
            console.log(err.stack);
        });
    });
}