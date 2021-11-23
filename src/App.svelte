<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
    import {blur} from "svelte/transition";
	import Description from "./Description.svelte";
	import Select from './Select.svelte';
	
	let showFullDescription;
	let location = 'Bundesgebiet';
	let age = ages[0];

	/**
	 * Returns a responsive height of the chart in px. It will be the window height if this is not bigger than 400px. It returns
	 * a smaller but dynamic value otherwise.
	 */
	function getHeight() {
		return Math.min(200 + window.innerHeight / 2, window.innerHeight);
	}
	/**
	 * Force a rerender of the chart on window resize e.g. rotating the phone.
	 */
	let resizeCounter = 0;
</script>

<header>
	<Description bind:opened={showFullDescription} />
	{#if !showFullDescription}
		<Select label="Region" values={locations} bind:value={location} focus />
		<Select label="Altersgruppe" values={ages} bind:value={age} />
	{/if}
</header>

<svelte:window on:resize={() => resizeCounter++} />

{#await promise then data}
	{#if !showFullDescription}
		{#key resizeCounter}
			<div in:blur={{delay: 400}} out:blur>
				<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height={getHeight()}
					lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
			</div>
		{/key}
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