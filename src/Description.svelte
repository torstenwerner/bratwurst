<script>
	import Chart from 'svelte-frappe-charts';
	import {postChanges} from './repository';
</script>

<p>
    Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
    Die Daten werden vom RKI täglich aktualisiert.
    Hinweis: die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
</p>
<div class="w-100">
    <Chart title="Nachmeldungen" data={postChanges} type="bar" height="400"/>
</div>

<style>
	.w-100 {
		width: 100%;
	}
</style>