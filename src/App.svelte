<script>
	import ReportedData from "./ReportedData.svelte";
	import ProjectedData from "./ProjectedData.svelte";
	import { blur } from "svelte/transition";
	import { onMount } from "svelte";

	/**
	 * Implement hash navigation.
	 */
	const componentMap = {
		"#reported": ReportedData,
		"#projected": ProjectedData,
	};
	let component;
	function hashChange() {
		component = componentMap[location.hash] || ReportedData;
	}
	onMount(hashChange);
</script>

<svelte:window on:hashchange={hashChange} />

<div transition:blur>
	<svelte:component this={component} />
</div>
