<script>
	import DailyData from "./DailyData.svelte";
	import WeeklyProjection from "./WeeklyProjection.svelte";
	import { blur } from "svelte/transition";

	let showDailyData = true;
</script>

<!-- <input type="checkbox" bind:checked={showDailyData} /> -->

{#if showDailyData}
	<div transition:blur><DailyData /></div>
{:else}
	<div transition:blur><WeeklyProjection /></div>
{/if}
