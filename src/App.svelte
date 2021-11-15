<script>
	import Chart from 'svelte-frappe-charts';
	
	const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
	    'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
    	'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];
	let location = 'Sachsen';
	async function fetchData(location) {
		return fetch(`/data/${location}.json`)
			.then(response => response.json())
			.then(json => ({
				labels: json.map(row => row.date).reverse(),
				datasets: [{values: json.map(row => row.incidence).reverse()}]
			}));
	}

	let promise = fetchData('Sachsen')
</script>

<h1>{location}</h1>

{#await promise then data}
	<Chart title="Inzidenz" data={data} type="line" height="800" lineOptions={{dotSize: 3, regionFill: 1}}
		axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}
