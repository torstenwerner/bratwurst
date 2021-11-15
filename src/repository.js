export function fetchData(location) {
    return fetch(`/data/${location}.json`)
        .then(response => response.json())
        .then(json => ({
            labels: json.map(row => row.date).reverse(),
            datasets: [{values: json.map(row => row.incidence).reverse()}]
        }));
}

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];
