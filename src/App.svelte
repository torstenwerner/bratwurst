<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
	import Description from "./Description.svelte";
	import Select from './Select.svelte';
	
	let location = 'Bundesgebiet';
	let age = ages[0];
</script>

<header>
	<Description/>
	<Select label="Region" values={locations} bind:value={location} focus/>
	<Select label="Altersgruppe" values={ages} bind:value={age}/>
</header>

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height="800"
		lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}

<style>
	:global(:root) {
		--gray-color: #777;
        --select-focus-border: #7cd6fd;
	}
	:root {
		--margin-size1: 50vw;
		--margin-size2: 35em;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		align-items: flex-end;
		margin: 0 max(0px, var(--margin-size1) - var(--margin-size2));
	}
</style>