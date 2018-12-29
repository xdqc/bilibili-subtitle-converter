const fs = require('fs');
const file=process.argv[2];

if (!file) {
    process.abort();
}

const vtt = fs.readFileSync('./'+file);
const lines = vtt.toString().split('\n');

const startLine = lines.indexOf('');

const bcc = {
    "font_size": 0.4,
    "font_color": "#FFFFFF",
    "background_alpha": 0.5,
    "background_color": "#9C27B0",
    "Stroke": "none",
    "body": []
}

transformVtt(bcc);
fs.writeFile(file+'.bcc', JSON.stringify(bcc, null, 2), (err) => console.log(err));


function transformVtt(bcc) {
    
    for (let i = startLine + 1; i < lines.length; i += 3) {
        const timeLine = lines[i];
        const textLine = lines[i + 1];
    
        if (!textLine) {
            continue;
        }
    
        let time1 = timeLine.split(' --> ')[0];
        let time2 = timeLine.split(' --> ')[1];
    
        time1 = hms2second(time1);
        time2 = hms2second(time2);
    
        const nextTimeLine = lines[i+3];
        if (nextTimeLine) {
            let nextTime1 = hms2second(nextTimeLine.split(' --> ')[0]);
            if (nextTime1<time2) {
                time2 = nextTime1;
            }
        }
    
        const text = textLine.replace(/<[^<>]+>/g, '');
        bcc.body.push({
            'from':time1,
            'to':time2,
            'location':2,
            'content':text
        });
    }
}

function hms2second(hms) {
    return parseInt(hms.split(':')[0]) * 3600 + parseInt(hms.split(':')[1]) * 60 + parseFloat(hms.split(':')[2]);
}
