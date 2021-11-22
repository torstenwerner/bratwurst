<script>
	import Chart from 'svelte-frappe-charts';
	import {postChanges} from './repository';
    import {blur} from "svelte/transition";

    export let opened = false;
</script>

<p>
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
    Die Daten werden vom RKI täglich aktualisiert.
</p>

{#if opened}
    <p in:blur={{delay: 400}} out:blur>
        Die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
    </p>
    <p in:blur={{delay: 400}} out:blur>
        Desweiteren gibt es einen Meldeverzug, so dass die aktuellsten Werte leider ungenau sind. Das folgende Diagram zeigt beispielhaft
        den ursprünglichen Inzidenzwert für den 07.11.2021 und wie er jeden weiteren Tag nach oben korrigiert wurde. Nach etwa 2
        Wochen ist der Wert knapp doppelt so hoch wie ursprünglich.
    </p>
    <div class="w-100" in:blur={{delay: 400}} out:blur>
        <Chart title="Nachmeldungen" data={postChanges} type="bar" height="400"/>
    </div>
    <p on:click={() => opened = false} class="trigger" in:blur={{delay: 400}} out:blur>
        Inzidenzdaten zeigen...
    </p>
{:else}
    <p on:click={() => opened = true} class="trigger" in:blur={{delay: 400}} out:blur>
        Mehr Informationen...
    </p>
{/if}

<style>
    p {
        margin-block: 0;
    }
	.w-100 {
		width: 100%;
	}
    .trigger {
        color: var(--select-focus-border);
        cursor: pointer;
        min-width: 100%;
    }
</style>