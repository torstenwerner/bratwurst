<script>
	import Chart from 'svelte-frappe-charts';
	
	const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
	    'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
    	'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];
	let location = 'Bundesgebiet';

	async function fetchData(location) {
		return fetch(`/data/${location}.json`)
			.then(response => response.json())
			.then(json => ({
				labels: json.map(row => row.date).reverse(),
				datasets: [{values: json.map(row => row.incidence).reverse()}]
			}));
	}

	let promise = fetchData(location)
</script>

<select bind:value={location} on:change="{() => promise = fetchData(location)}">
	{#each locations as value}
		<option value={value}>
			{value}
		</option>
	{/each}
</select>

{#await promise then data}
	<Chart title="Inzidenz in {location}" data={data} type="line" height="800" lineOptions={{dotSize: 3, regionFill: 1}}
		axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}
