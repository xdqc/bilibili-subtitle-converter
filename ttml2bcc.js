const fs = require('fs');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const file = process.argv[2];

if (!file) {
    console.error('pass file arg!');
    return 1;
}

const zhCN = file.endsWith('zh-Hans.ttml');


fs.readFile('./' + file, (err, data) => {
    
    if (err) {
        console.error(err);
        return 1;
    }

    if (zhCN) {
        var enFile = file.replace('zh-Hans', 'en');
        var eData = fs.readFileSync('./' + enFile);
    }

    fs.writeFile(file + '.bcc', JSON.stringify(buildBcc(data, eData), null, 2), (err) => console.log(err ? err : file + ' Succeed!'));
});

function buildBcc(ttml, eTtml) {
    const bcc = {
        "font_size": 0.4,
        "font_color": "#FFFFFF",
        "background_alpha": 0.5,
        "background_color": "#9C27B0",
        "Stroke": "none",
        "body": []
    }

    const lines = ttml.toString().split('\n');
    const eLines = eTtml ? eTtml.toString().split('\n') : undefined;

    const firstLine = lines.findIndex(line => line.startsWith("<p "));
    const lastLine = lines.findIndex(line => line.startsWith("</body>"));

    for (let i = firstLine; i < lastLine; i++) {
        const doc = new dom().parseFromString(lines[i]);

        // const time1 = hhmmss2second(xpath.select1('/p/@begin', doc).value);
        // let time2 = hhmmss2second(xpath.select1('/p/@end', doc).value);

        // // prevent subtitle overlapping or showing prev and current line at the same time
        // if (i < lastLine - 1) {
        //     const nextDoc = new dom().parseFromString(lines[i + 1]);
        //     let nextTime1 = hhmmss2second(xpath.select1('/p/@begin', nextDoc).value);
        //     if (parseFloat(nextTime1) < parseFloat(time2)) {
        //         time2 = nextTime1;
        //     }
        // }
        
       const time1 = (xpath.select1('/p/@t', doc).value) / 1000;
       const time2 = time1 + (xpath.select1('/p/@d', doc).value) / 1000;
        let text = xpath.select('string(//p)', doc);

        if (zhCN) {
            const eDoc = new dom().parseFromString(eLines[i]);
            const eText = xpath.select('string(//p)', eDoc);
            text = eText + '\n' + text;
        }
       
        bcc.body.push({
            'from': time1,
            'to': time2,
            'location': 2,
            'content': text,
        });
    }

    return bcc;
}


function hhmmss2second(hms) {
    return hms.split(':').reduce((a, c, i) => a + c * 60 ** (2 - i), 0).toFixed(2);
}
