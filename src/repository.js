const url = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv';

function rki2Frappe(dataset, csvLine) {
    const [date, location, , age, , incidence] = csvLine.split(',');
    if (!dataset[location]) {
        dataset[location] = {};
    }
    if (!dataset[location][age]) {
        dataset[location][age] = {
            labels: [],
            datasets: [{values: []}]
        };
    }
    dataset[location][age].labels.push(date);
    dataset[location][age].datasets[0].values.push(incidence);
    return dataset;
}

function parse(csv) {
    return csv
        .split('\n')
        .slice(1)
        .reverse()
        .reduce((result, current) => rki2Frappe(result, current), {});
}

export const promise = fetch(url)
    .then(response => response.text())
    .then(csv => parse(csv));

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];

export const postChanges = {
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    datasets: [{values: [4.02, 4.22, 4.83, 5.39, 5.89, 6.23, 6.5, 6.61, 6.67, 6.87, 7.08, 7.21, 7.31, 7.41, 7.43]}]
};
