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
		--gray-color: #777;
        --select-focus-border: rgb(124, 214, 253);
	}
	label {
		padding: 0.25rem 0.75rem;
        color: var(--gray-color);
        font-size: 00.75rem;
	}
	select {
		width: 25ch;
		border: 1px solid var(--gray-color);
    	border-radius: 0.25em;
		padding: 0.25em 0.5em;
		cursor: pointer;
	}
    select:focus {
        border-color: var(--select-focus-border);
        outline-color: var(--select-focus-border);
    }
</style>