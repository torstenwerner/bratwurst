<script>
	import DailyData from "./DailyData.svelte";
	import WeeklyProjection from "./WeeklyProjection.svelte";
	import { blur } from "svelte/transition";

	/**
	 * Show reported data vs. projected data.
	 */
	let showReportedData = true;
</script>

{#if showReportedData}
	<div transition:blur>
		<DailyData on:click={() => (showReportedData = false)} />
	</div>
{:else}
	<div transition:blur>
		<WeeklyProjection on:click={() => (showReportedData = true)} />
	</div>
{/if}
