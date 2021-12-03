const url = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv';

function rki2Frappe(dataset, csvLine) {
    const [date, location, , age, , incidence] = csvLine.split(',');
    if (!dataset[location]) {
        dataset[location] = {};
    }
    if (!dataset[location][age]) {
        dataset[location][age] = {
            labels: [],
            datasets: [{ values: [] }]
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
