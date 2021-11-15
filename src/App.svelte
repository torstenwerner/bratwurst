<script>
	import Chart from 'svelte-frappe-charts';
	
	let promise = fetch('/bratwurst.json')
		.then(response => response.json())
		.then(json => ({
			labels: json.map(row => row.date).reverse(),
			datasets: [{values: json.map(row => row.incidence).reverse()}]
		}));
</script>

{#await promise then data}
	<Chart title="Inzidenz" data={data} type="line" height="1000" lineOptions={{dotSize: 3}}
		axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />	
{/await}
