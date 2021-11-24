<script>
	import DailyData from "./DailyData.svelte";
	import WeeklyProjection from "./WeeklyProjection.svelte";
	import { blur } from "svelte/transition";

	let showDailyData = true;
</script>

{#if showDailyData}
	<div transition:blur><DailyData on:click={() => showDailyData = false} /></div>
{:else}
	<div transition:blur><WeeklyProjection on:click={() => showDailyData = true} /></div>
{/if}
