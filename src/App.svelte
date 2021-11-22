<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
    import {blur} from "svelte/transition";
	import Description from "./Description.svelte";
	import Select from './Select.svelte';
	
	let showFullDescription;
	let location = 'Bundesgebiet';
	let age = ages[0];
	let height = Math.min(200 + window.innerHeight / 2, window.innerHeight);
</script>

<header>
	<Description bind:opened={showFullDescription} />
	{#if !showFullDescription}
		<Select label="Region" values={locations} bind:value={location} focus />
		<Select label="Altersgruppe" values={ages} bind:value={age} />
	{/if}
</header>

{#await promise then data}
	{#if !showFullDescription}
		<div in:blur={{delay: 400}} out:blur>
			<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height={height}
				lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
		</div>
	{/if}
{/await}

<style>
	:global(:root) {
		--gray-color: #777;
        --blue-color: #7cd6fd;
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