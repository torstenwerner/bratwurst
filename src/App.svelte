<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages, postChanges} from './repository';
	import Select from './Select.svelte';
	
	let location = 'Bundesgebiet';
	let age = ages[0];
</script>

<header>
	<p>
		Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
		Die Daten werden vom RKI täglich aktualisiert.
		Hinweis: die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
	</p>	
	<Select label="Region" values={locations} bind:value={location} focus/>
	<Select label="Altersgruppe" values={ages} bind:value={age}/>
</header>

<Chart title="Nachmeldungen" data={postChanges} type="bar" height="400" />

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height="800"
		lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}

<style>
	:root {
		--margin-size1: 50vw;
		--margin-size2: 35em;
	}
	.size3 {
		width: max(0px, var(--size1) - var(--size2));
	}
	header {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		align-items: flex-end;
		margin: 0 max(0px, var(--margin-size1) - var(--margin-size2));
	}
	p {
		margin: 0.5em 0;
	}
</style>