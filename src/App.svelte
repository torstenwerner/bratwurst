<script>
	import Chart from 'svelte-frappe-charts';
	import {promise, locations, ages} from './repository';
	
	let location = 'Bundesgebiet';
	let age = ages[0];
</script>

<header>
	<div class=select-container>
		<label for="location">Region</label>
		<select name="location" bind:value={location}>
			{#each locations as value}
				<option value={value}>
					{value}
				</option>
			{/each}
		</select>	
	</div>
	
	<div class=select-container>
		<label for="age">Altersgruppe</label>
		<select name="age" bind:value={age}>
			{#each ages as value}
				<option value={value}>
					{value}
				</option>
			{/each}
		</select>
	</div>
	
	<p>
		Es werden die Daten des Robert-Koch-Instituts zur Hospitalisierungsinzidenz für Deutschland angezeigt.
		Hinweis: die Werte bis einschließlich Mai 2020 sind sehr ungenau, weil das Meldesystem zu dieser Zeit erst aufgebaut wurde.
	</p>	
</header>

{#await promise then data}
	<Chart title="Hospitalisierungsinzidenz" data={data[location][age]} type="line" height="800"
		lineOptions={{dotSize: 3, regionFill: 1}} axisOptions={{xIsSeries: true, xAxisMode: 'tick'}} />
{/await}

<style>
	:root {
		--select-border: #777;
		--select-arrow: var(--select-border);
	}
	header {
		display: flex;
		gap: 1em;
		align-items: flex-end;
	}
	.select-container {
		display: inline-block;
	}
	label {
		padding: 0.25em 0.75em;
	}
	select {
		width: 15ch;
		border: 1px solid var(--select-border);
    	border-radius: 0.25em;
		padding: 0.25em 0.5em;
		cursor: pointer;
	}
	p {
		margin: 0.5em 0;
	}
</style>