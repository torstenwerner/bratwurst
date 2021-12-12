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

	/**
	 * Hides all elements in index.html with class seoText.
	 */
	function hideSeoText() {
        document
            .querySelectorAll(".seoText")
            .forEach((node) => (node.hidden = true));
    }
    onMount(hideSeoText);
</script>

<svelte:window on:hashchange={hashChange} />

{#key component}
	<div in:blur={{duration: 400, delay: 400}} out:blur={{duration: 400}}>
		<svelte:component this={component} />
	</div>
{/key}
