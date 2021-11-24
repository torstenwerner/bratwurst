<script>
	import DailyData from "./DailyData.svelte";
	import WeeklyProjection from "./WeeklyProjection.svelte";
	import { blur } from "svelte/transition";

	let showDailyData = true;
</script>

{#if showDailyData}
	<div transition:blur><DailyData bind:show={showDailyData}/></div>
{:else}
	<div transition:blur><WeeklyProjection bind:hide={showDailyData} /></div>
{/if}
