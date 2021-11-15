const url = 'https://raw.githubusercontent.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland/master/Aktuell_Deutschland_COVID-19-Hospitalisierungen.csv';

function parse(csv) {
    function reduceLocation(result, current) {
        (result[current.location] = (result[current.location] || [])).push(current.value);
        return result;
    }

    function reduceAge(result, current) {
        (result[current.age] = (result[current.age] || [])).push(current.value);
        return result;
    }

    function toFrappe(value) {
        const byAge = Object.entries(value)
            .map(([age, value]) => ([age, {
                labels: value.map(row => row.date).reverse(),
                datasets: [{values: value.map(row => row.incidence).reverse()}]
            }]));
        return Object.fromEntries(byAge);
    }

    const byLocation = csv.split('\n').slice(1)
        .map(line => line.split(','))
        .map(([date, location, , age, , incidence]) => ({location, value: {age, value: {date, incidence}}}))
        .reduce((result, current) => reduceLocation(result, current), {});
    const byLocationAndAge = Object.entries(byLocation)
        .map(([location, value]) => ([location, toFrappe(value.reduce((result, current) => reduceAge(result, current), {}))]));
    return Object.fromEntries(byLocationAndAge);
}

export const promise = fetch(url)
    .then(response => response.text())
    .then(csv => parse(csv));

export const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

export const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];
