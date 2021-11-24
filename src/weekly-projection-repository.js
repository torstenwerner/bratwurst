const url = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_adjustierte-COVID-19-Hospitalisierungen.csv';

function rki2Frappe(dataset, csvLine) {
    const [date, , , , , , data, projection] = csvLine.split(',');
    dataset.labels.push(date);
    dataset.datasets[0].values.push(data);
    dataset.datasets[1].values.push(projection);
    return dataset;
}

function parse(csv) {
    return csv
        .split('\n')
        .slice(1)
        .reverse()
        .reduce((result, current) => rki2Frappe(result, current), {
            labels: [],
            datasets: [{ name: 'Meldung', values: [] }, { name: 'Schätzung', values: [] }]
        });
}

export const promise = fetch(url)
    .then(response => response.text())
    .then(csv => parse(csv));
