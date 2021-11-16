<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
	import Select from './Select.svelte';
	
	let location = 'Bundesgebiet';
	let age = ages[0];
</script>

<header>
	<Select label="Region" values={locations} bind:value={location}/>
	<Select label="Altersgruppe" values={ages} bind:value={age}/>
	
	<p>
		Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
		Hinweis: die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
	</p>	
</header>

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height="800"
		lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}

<style>
	header {
		display: flex;
		gap: 1em;
		align-items: flex-end;
	}
	p {
		margin: 0.5em 0;
	}
</style>