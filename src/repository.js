import dataworker from 'web-worker:./dataworker.js';

export const promise = new Promise(resolve => {
    const rkiParser = new dataworker();
    rkiParser.onmessage = (event) => {
        resolve(event.data);
        rkiParser.terminate();
    }
    rkiParser.postMessage(null);
});

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];
