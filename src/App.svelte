<script>
	import Chart from 'svelte-frappe-charts';
	import {fetchData, locations} from './repository';
	
	let location = 'Bundesgebiet';

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
