<script>
    import { blur } from "svelte/transition";
    import Select from "svelte-select";
    import { tick } from "svelte";

    export let label;
    export let values;
    export let value;
    export let focus = false;

    function value2item(value) {
        return { value, label: value };
    }

    let item = value2item(value);
    $: if (item != null) {
        value = item.value;
    } else {
        tick().then(() => item = value2item(values[0]));
    }
</script>

<div transition:blur class="container">
    <div class="label">{label}</div>
    <div class="select">
        <Select items={values} bind:value={item} isFocused={focus} />
    </div>
</div>

<style>
    .container {
        margin-right: 1em;
        --borderFocusColor: var(--blue-color);
        --itemIsActiveBG: var(--blue-color);
        --itemHoverBG: var(--light-blue-color);
    }
    .label {
        padding: 0.25rem 0.75rem;
        color: var(--gray-color);
        font-size: 0.75rem;
    }
    .select {
        width: 25ch;
        padding: 0.25em 0.5em;
    }
</style>
