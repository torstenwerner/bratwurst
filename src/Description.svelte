<script>
	import Chart from 'svelte-frappe-charts';
	import {postChanges} from './repository';
    import {blur} from "svelte/transition";

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
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
    Die Daten werden vom RKI täglich aktualisiert.
</p>

{#if endOpen}
    <div transition:blur on:outroend={() => startOpen = false} >
        <p>
            Die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
        </p>
        <p>
            Desweiteren gibt es einen Meldeverzug, so dass die aktuellsten Werte leider ungenau sind. Das folgende Diagram zeigt beispielhaft
            den ursprünglichen Inzidenzwert für den 07.11.2021 und wie er jeden weiteren Tag nach oben korrigiert wurde. Nach etwa 2
            Wochen ist der Wert knapp doppelt so hoch wie ursprünglich.
        </p>
        <div>
            <Chart title="Nachmeldungen" data={postChanges} type="bar" height="400"/>
        </div>
        <p on:click={() => endOpen = false} class="trigger" >
            Inzidenzdaten zeigen...
        </p>    
    </div>
{:else if !startOpen}
    <p on:click={() => startOpen = true} on:outroend={() => endOpen = true} class="trigger" transition:blur>
        Mehr Informationen...
    </p>
{/if}

<style>
    p {
        margin-block: 0;
    }
    .trigger {
        color: var(--blue-color);
        cursor: pointer;
        min-width: 100%;
    }
</style>