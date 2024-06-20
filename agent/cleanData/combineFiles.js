import fs from 'node:fs';

(async () => {
    await parseAllFiles();
    console.log("All finished!")
})();

async function parseAllFiles() {

    const __dirname = new URL('../data/exploit', import.meta.url).pathname;
    const files = fs.readdirSync(__dirname).filter(fn => fn.endsWith('.webgateway'));
    const writerStream = fs.createWriteStream('logs_proxy_format_exploit.log');

    files.forEach(file => {
        console.info("reading file: ", __dirname + "/" + file);
        const readerStream = fs.createReadStream(__dirname + "/" + file)
        readerStream.setEncoding('UTF8');
        readerStream.on('data', chunk => {
            writerStream.write(chunk);
        })
        readerStream.on('error', function (err) {
            console.log(err.stack);
        });
    });
}