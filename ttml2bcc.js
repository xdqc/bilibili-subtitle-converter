const fs = require('fs');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;
const file = process.argv[2];

if (!file) {
    console.error('pass file arg!');
    return 1;
}


fs.readFile('./' + file, (err, data) => {

    if (err) {
        console.error(err);
        return 1;
    }

    fs.writeFile(file + '.bcc', JSON.stringify(buildBcc(data), null, 2), (err) => console.log(err ? err : file + ' Succeed!'));
});

function buildBcc(ttml) {
    const bcc = {
        "font_size": 0.4,
        "font_color": "#FFFFFF",
        "background_alpha": 0.5,
        "background_color": "#9C27B0",
        "Stroke": "none",
        "body": []
    }

    const lines = ttml.toString().split('\n');

    const firstLine = lines.findIndex(line => line.startsWith("<p "));
    const lastLine = lines.findIndex(line => line.startsWith("</div>"));

    for (let i = firstLine; i < lastLine; i++) {
        const doc = new dom().parseFromString(lines[i]);

        const time1 = hhmmss2second(xpath.select1('/p/@begin', doc).value);
        let time2 = hhmmss2second(xpath.select1('/p/@end', doc).value);
        const text = xpath.select('string(//p)', doc);

        // prevent subtitle overlapping or showing prev and current line at the same time
        if (i < lastLine - 1) {
            const nextDoc = new dom().parseFromString(lines[i + 1]);
            let nextTime1 = hhmmss2second(xpath.select1('/p/@begin', nextDoc).value);
            if (parseFloat(nextTime1) < parseFloat(time2)) {
                time2 = nextTime1;
            }
        }

        bcc.body.push({
            'from': time1,
            'to': time2,
            'location': 2,
            'content': text
        });
    }

    return bcc;
}


function hhmmss2second(hms) {
    return hms.split(':').reduce((a, c, i) => a + c * 60 ** (2 - i), 0).toFixed(2);
}
