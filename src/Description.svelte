<script>
    import Chart from "svelte-frappe-charts";
    import { postChanges as data } from "./daily-data-repository";
    import { blur } from "svelte/transition";

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
</script>

<p>
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz
    für Deutschland angezeigt. Die Daten werden vom RKI täglich aktualisiert.
</p>

{#if endOpen}
    <div transition:blur on:outroend={() => (startOpen = false)}>
        <p>
            Die Daten und weitere Erläuterungen dazu werden vom RKI unter der Adresse
            <a target="_blank" href="https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland">
                https://github.com/robert-koch-institut/COVID-19-Hospitalisierungen_in_Deutschland
            </a>
            veröffentlicht.
        </p>
        <p>
            Die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das
            Meldesystem zu dieser Zeit erst aufgebaut wurde.
        </p>
        <p>
            Desweiteren gibt es einen Meldeverzug, so dass die aktuellsten Werte
            leider ungenau sind. Das folgende Diagram zeigt beispielhaft den
            ursprünglichen Inzidenzwert für den 07.11.2021 und wie er jeden
            weiteren Tag nach oben korrigiert wurde. Nach etwa 2 Wochen ist der
            Wert knapp doppelt so hoch wie ursprünglich.
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
    p {
        margin-block-start: 0;
        margin-block-end: 0.5em;
    }
    .trigger {
        min-width: 100%;
    }
</style>
