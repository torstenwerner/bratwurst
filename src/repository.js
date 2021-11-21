const mainUrl = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv';
const correctionUrl = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_adjustierte-COVID-19-Hospitalisierungen.csv';

function rki2Frappe(dataset, csvLine) {
    const [date, location, , age, , incidence] = csvLine.split(',');
    if (!!date) {
        if (!dataset[location]) {
            dataset[location] = {};
        }
        if (!dataset[location][age]) {
            dataset[location][age] = {
                labels: [],
                datasets: [{values: []},{values: []}]
            };
        }
        dataset[location][age].labels.push(date);
        dataset[location][age].datasets[0].values.push(!!correctionData[date] ? incidence * correctionData[date] : null);
        dataset[location][age].datasets[1].values.push(incidence);
    }
    return dataset;
}

function mainParse(csv) {
    return csv
        .split('\n')
        .slice(1)
        .reverse()
        .reduce((result, current) => rki2Frappe(result, current), {});
}

function rki2Correction(correction, csvLine) {
    const [date, , , , , , measuredValue, correctedValue] = csvLine.split(',')
    if (!!date) {
        correction[date] = correctedValue / measuredValue;
    }
    return correction;
}

function correctionParse(csv) {
    return csv
        .split('\n')
        .slice(1)
        .reduce((result, current) => rki2Correction(result, current), {});
}

let correctionData;

export const promise = fetch(correctionUrl)
    .then(response => response.text())
    .then(csv => correctionData = correctionParse(csv))
    .then(() => fetch(mainUrl))
    .then(response => response.text())
    .then(csv => mainParse(csv));

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];
