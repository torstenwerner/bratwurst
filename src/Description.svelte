<script>
	import Chart from 'svelte-frappe-charts';
	import {postChanges} from './repository';
    import {blur, slide} from "svelte/transition";

    export let opened = false;
</script>

<p>
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
    Die Daten werden vom RKI täglich aktualisiert.
</p>

{#if opened}
    <div in:slide={{delay: 400}} out:blur>
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
        <p on:click={() => opened = false} class="trigger" >
            Inzidenzdaten zeigen...
        </p>    
    </div>
{:else}
    <p on:click={() => opened = true} class="trigger" in:blur={{delay: 400}} out:blur>
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