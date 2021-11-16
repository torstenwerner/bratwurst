<script>
    export let label;
    export let values;
    export let value;
    export let focus = false;
    function initFocus(element) {
        if (focus) {
            element.focus();
        }
    }
</script>

<div>
    <label for="select">{label}</label>
    <select name="select" bind:value use:initFocus>
        {#each values as value}
            <option value={value}>
                {value}
            </option>
        {/each}
    </select>	
</div>

<style>
	:root {
		--select-border: #777;
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
</style>