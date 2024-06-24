import fs from 'node:fs';

(async () => {
    if (process.argv.length < 3 ) {
        console.error("Error: must include exactly 1 command line argument");
        return;
    }
    const logtype = process.argv[2];
    if (logtype !== "benign"  && logtype !== "exploit") {
        console.error("Error: command line argument must be EITHER 'exploit' or 'benign'");
        return;
    }

    await parseAllFiles();
})();

async function parseAllFiles() {

    const __dirname = new URL('../data/' + process.argv[2], import.meta.url).pathname;
    const files = fs.readdirSync(__dirname).filter(fn => fn.endsWith('.webgateway'));
    const writerStream = fs.createWriteStream('../data/logs_proxy_format_' + process.argv[2] + '.log');

    files.forEach(file => {
        console.info("reading file: ", __dirname + "/" + file);
        const readerStream = fs.createReadStream(__dirname + "/" + file)
        readerStream.setEncoding('UTF8');
        readerStream.on('data', chunk => {
            chunk = chunk.replace(/['"]+/g, ''); // remove all quotation marks from files
            chunk = chunk.replace(/  +/g, ' ') // change all double spaces to singular ones
            writerStream.write(chunk);
        })
        readerStream.on('error', function (err) {
            console.log(err.stack);
        });
    });
}