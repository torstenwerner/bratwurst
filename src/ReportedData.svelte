<script>
	import Chart from "svelte-frappe-charts";
	import { promise } from "./reported-data-repository";
	import { locations, currentLocation, ages, currentAge } from "./metadata";
	import { blur } from "svelte/transition";
	import Description from "./Description.svelte";
	import Select from "./Select.svelte";
	import { onMount } from "svelte";

    let startShowFullDescription;
	let height;
	/**
	 * Force a rerender of the chart on window resize e.g. rotating the phone.
	 */
	let resizeCounter = 0;
	/**
	 * Sets a responsive height of the chart in px. It will be the window height if this is not bigger than 400px. It returns
	 * a smaller but dynamic value otherwise. Increases the resizeCounter as well.
	 */
	function onResize() {
		height = Math.min(200 + window.innerHeight / 2, window.innerHeight);
		resizeCounter++;
	}
	onMount(onResize);
</script>

<header>
	<Description bind:startOpen={startShowFullDescription} />
	{#if !startShowFullDescription}
		<Select label="Region" values={locations} bind:value={$currentLocation} focus />
		<Select label="Altersgruppe" values={ages} bind:value={$currentAge} />
        <a href="#projected" class="navigation">Adjustierte Schätzdaten anzeigen...</a>
	{/if}
</header>

<svelte:window on:resize={onResize} />

{#await promise}
	<p transition:blur={{ delay: 2000, duration: 2000 }}>Bitte warten...</p>
{:then data}
	{#if !startShowFullDescription && $currentLocation && $currentAge}
		{#key resizeCounter}
			<div transition:blur>
				<Chart
					title="Hospitalisierungsinzidenz"
					data={data[$currentLocation]?.[$currentAge]}
					type="line"
					{height}
					lineOptions={{ dotSize: 3, regionFill: 1 }}
					axisOptions={{ xIsSeries: true, xAxisMode: "tick" }}
				/>
			</div>
		{/key}
	{/if}
{:catch}
	<p class="error-message" transition:blur>Beim Laden der Daten ist ein Fehler aufgetreten.</p>
{/await}

<style>
	:root {
		--margin-size1: 50vw;
		--margin-size2: 35em;
	}
	.error-message {
		text-align: center;
		margin-top: 10%;
	}
</style>
