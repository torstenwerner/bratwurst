<script>
	import ReportedData from "./ReportedData.svelte";
	import ProjectedData from "./ProjectedData.svelte";
	import { blur } from "svelte/transition";

	/**
	 * Show reported data vs. projected data.
	 */
	let showReportedData = true;
</script>

{#if showReportedData}
	<div transition:blur>
		<ReportedData on:click={() => (showReportedData = false)} />
	</div>
{:else}
	<div transition:blur>
		<ProjectedData on:click={() => (showReportedData = true)} />
	</div>
{/if}
