<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
	
	let location = 'Bundesgebiet';
	let age = ages[0];
</script>

<label for="location">Land/Gebiet</label>
<select name="location" bind:value={location}>
	{#each locations as value}
		<option value={value}>
			{value}
		</option>
	{/each}
</select>

<label for="age">Altersgruppe</label>
<select name="age" bind:value={age}>
	{#each ages as value}
		<option value={value}>
			{value}
		</option>
	{/each}
</select>

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height="800"
		lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}
