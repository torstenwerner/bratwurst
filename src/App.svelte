<script>
	import Chart from 'svelte-frappe-charts';
	import {fetchData, locations, ages} from './repository';
	
	let location = 'Bundesgebiet';
	let age = ages[0];

	let promise = fetchData(location, age);
</script>

<label for="location">Land/Gebiet</label>
<select name="location" bind:value={location} on:change="{() => promise = fetchData(location, age)}">
	{#each locations as value}
		<option value={value}>
			{value}
		</option>
	{/each}
</select>

<label for="age">Altersgruppe</label>
<select name="age" bind:value={age} on:change="{() => promise = fetchData(location, age)}">
	{#each ages as value}
		<option value={value}>
			{value}
		</option>
	{/each}
</select>

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz {location} Altersgruppe {age}" data={data} type="line" height="800" lineOptions={{dotSize: 3, regionFill: 1}}
		axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}
