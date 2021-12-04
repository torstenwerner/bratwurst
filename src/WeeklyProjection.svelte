<script>
    import Chart from "svelte-frappe-charts";
    import { promise } from "./weekly-projection-repository";
	import { locations, currentLocation } from "./metadata";
    import { blur } from "svelte/transition";
	import Select from "./Select.svelte";
	import { onMount } from "svelte";

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
    <p>
        Es werden die täglich aktualisierten Schätzdaten im Vergleich zu den Meldedaten angezeigt.
        Die Schätzung enthält eine Korrektur für den Meldeverzug.
    </p>
    <Select label="Region" values={locations} bind:value={$currentLocation} focus />
    <p on:click class="link">Tägliche Meldedaten anzeigen...</p>
</header>

{#await promise}
    <p transition:blur={{ delay: 2000, duration: 2000 }}>Bitte warten...</p>
{:then data}
    {#key resizeCounter}
        <div transition:blur>
            <Chart
                title="Hospitalisierungsinzidenz"
                data={data[$currentLocation]}
                type="line"
                {height}
                lineOptions={{ dotSize: 3, regionFill: 1 }}
                axisOptions={{ xIsSeries: true, xAxisMode: "tick" }}
            />
        </div>
    {/key}
{:catch}
    <p transition:blur>Beim Laden der Daten ist ein Fehler aufgetreten.</p>
{/await}
