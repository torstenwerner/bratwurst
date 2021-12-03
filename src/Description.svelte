<script>
    import Chart from "svelte-frappe-charts";
    import { postChanges as data } from "./metadata";
    import { blur } from "svelte/transition";
    import { onMount } from "svelte";

    /**
     * Will be set to true as soon as showing the full description has been triggered. Will be set to false as soon as the full
     * description is hidden at the end of the animation.
     */
    export let startOpen = false;
    /**
     * Will be set to true at the end of the transition of the full description. Will be set to false as soon as hiding the full
     * description has been triggered.
     */
    export let endOpen = false;

    function copyFromIndexHtml(node, id) {
        node.innerHTML = document.getElementById(id).innerHTML;
    }
    function hideSeoText() {
        document
            .querySelectorAll(".seoText")
            .forEach((node) => (node.hidden = true));
    }
    onMount(hideSeoText);
</script>

<p use:copyFromIndexHtml={"introReportedData"} />

{#if endOpen}
    <div transition:blur on:outroend={() => (startOpen = false)}>
        <p use:copyFromIndexHtml={"extraReportedData01"} />
        <p use:copyFromIndexHtml={"extraReportedData02"} />
        <p>
            Das folgende Diagram zeigt beispielhaft den ursprünglichen
            Inzidenzwert für den 07.11.2021 und wie er jeden weiteren Tag nach
            oben korrigiert wurde. Nach etwa 2 Wochen ist der Wert knapp doppelt
            so hoch wie ursprünglich.
        </p>
        <div>
            <Chart title="Nachmeldungen" {data} type="bar" height="400" />
        </div>
        <p on:click={() => (endOpen = false)} class="trigger link">
            Inzidenzdaten zeigen...
        </p>
    </div>
{:else if !startOpen}
    <p
        on:click={() => (startOpen = true)}
        on:outroend={() => (endOpen = true)}
        class="trigger link"
        transition:blur
    >
        Mehr Informationen...
    </p>
{/if}

<style>
    .trigger {
        min-width: 100%;
    }
</style>
