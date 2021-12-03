const url = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_adjustierte-COVID-19-Hospitalisierungen.csv';

function rki2Frappe(dataset, csvLine) {
    const [date, location, , , , , , , , , , data, projection] = csvLine.split(',');
    if (!dataset[location]) {
        dataset[location] = {
            labels: [],
            datasets: [{ name: `Meldung ${location}`, values: [] }, { name: `Schätzung ${location}`, values: [] }]
        };
    }
    dataset[location].labels.push(date);
    dataset[location].datasets[0].values.push(data);
    dataset[location].datasets[1].values.push(projection);
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
