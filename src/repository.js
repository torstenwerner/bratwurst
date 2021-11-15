export function fetchData(location, age) {
    console.log(age);
    return fetch(`data/${location}_${age}.json`)
        .then(response => response.json())
        .then(json => ({
            labels: json.map(row => row.date).reverse(),
            datasets: [{values: json.map(row => row.incidence).reverse()}]
        }));
}

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];
