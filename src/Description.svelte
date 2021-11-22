<script>
	import Chart from 'svelte-frappe-charts';
	import {postChanges} from './repository';

    export let opened = false;
</script>

<p>
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
    Die Daten werden vom RKI täglich aktualisiert.
</p>

{#if opened}
    <p>
        Hinweis: die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
    </p>
    <div class="w-100">
        <Chart title="Nachmeldungen" data={postChanges} type="bar" height="400"/>
    </div>
    <p on:click={() => opened = false} class="trigger">
        Informationen ausblenden...
    </p>
{:else}
    <p on:click={() => opened = true} class="trigger">
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