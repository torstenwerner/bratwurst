
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var frappeCharts_min_umd = createCommonjsModule(function (module, exports) {
    !function(t,e){module.exports=e();}(commonjsGlobal,function(){function t(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function e(t){var e=t.getBoundingClientRect();return {top:e.top+(document.documentElement.scrollTop||document.body.scrollTop),left:e.left+(document.documentElement.scrollLeft||document.body.scrollLeft)}}function i(t){return null===t.offsetParent}function n(t){var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)}function a(t){var e=window.getComputedStyle(t),i=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight);return t.clientWidth-i}function s(t,e,i){var n=document.createEvent("HTMLEvents");n.initEvent(e,!0,!0);for(var a in i)n[a]=i[a];return t.dispatchEvent(n)}function r(t){return t.titleHeight+t.margins.top+t.paddings.top}function o(t){return t.margins.left+t.paddings.left}function l(t){return t.margins.top+t.margins.bottom+t.paddings.top+t.paddings.bottom+t.titleHeight+t.legendHeight}function u(t){return t.margins.left+t.margins.right+t.paddings.left+t.paddings.right}function h(t){return parseFloat(t.toFixed(2))}function c(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];i||(i=n?t[0]:t[t.length-1]);var a=new Array(Math.abs(e)).fill(i);return t=n?a.concat(t):t.concat(a)}function d(t,e){return (t+"").length*e}function p(t,e){return {x:Math.sin(t*Zt)*e,y:Math.cos(t*Zt)*e}}function f(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return !Number.isNaN(t)&&(void 0!==t&&(!!Number.isFinite(t)&&!(e&&t<0)))}function v(t){return Number(Math.round(t+"e4")+"e-4")}function g(t){var e=void 0,i=void 0,n=void 0;if(t instanceof Date)return new Date(t.getTime());if("object"!==(void 0===t?"undefined":Ft(t))||null===t)return t;e=Array.isArray(t)?[]:{};for(n in t)i=t[n],e[n]=g(i);return e}function m(t,e){var i=void 0,n=void 0;return t<=e?(i=e-t,n=t):(i=t-e,n=e),[i,n]}function y(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length-t.length;return i>0?t=c(t,i):e=c(e,i),[t,e]}function b(t,e){if(t)return t.length>e?t.slice(0,e-3)+"...":t}function x(t){var e=void 0;if("number"==typeof t)e=t;else if("string"==typeof t&&(e=Number(t),Number.isNaN(e)))return t;var i=Math.floor(Math.log10(Math.abs(e)));if(i<=2)return e;var n=Math.floor(i/3),a=Math.pow(10,i-3*n)*+(e/Math.pow(10,i)).toFixed(1);return Math.round(100*a)/100+" "+["","K","M","B","T"][n]}function k(t,e){for(var i=[],n=0;n<t.length;n++)i.push([t[n],e[n]]);var a=function(t,e){var i=e[0]-t[0],n=e[1]-t[1];return {length:Math.sqrt(Math.pow(i,2)+Math.pow(n,2)),angle:Math.atan2(n,i)}},s=function(t,e,i,n){var s=a(e||t,i||t),r=s.angle+(n?Math.PI:0),o=.2*s.length;return [t[0]+Math.cos(r)*o,t[1]+Math.sin(r)*o]};return function(t,e){return t.reduce(function(t,i,n,a){return 0===n?i[0]+","+i[1]:t+" "+e(i,n,a)},"")}(i,function(t,e,i){var n=s(i[e-1],i[e-2],t),a=s(t,i[e-1],i[e+1],!0);return "C "+n[0]+","+n[1]+" "+a[0]+","+a[1]+" "+t[0]+","+t[1]})}function w(t){return t>255?255:t<0?0:t}function A(t,e){var i=ie(t),n=!1;"#"==i[0]&&(i=i.slice(1),n=!0);var a=parseInt(i,16),s=w((a>>16)+e),r=w((a>>8&255)+e),o=w((255&a)+e);return (n?"#":"")+(o|r<<8|s<<16).toString(16)}function P(t){var e=/(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;return /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i.test(t)||e.test(t)}function T(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function L(t,e){var i=document.createElementNS("http://www.w3.org/2000/svg",t);for(var n in e){var a=e[n];if("inside"===n)T(a).appendChild(i);else if("around"===n){var s=T(a);s.parentNode.insertBefore(i,s),i.appendChild(s);}else "styles"===n?"object"===(void 0===a?"undefined":Ft(a))&&Object.keys(a).map(function(t){i.style[t]=a[t];}):("className"===n&&(n="class"),"innerHTML"===n?i.textContent=a:i.setAttribute(n,a));}return i}function O(t,e){return L("linearGradient",{inside:t,id:e,x1:0,x2:0,y1:0,y2:1})}function M(t,e,i,n){return L("stop",{inside:t,style:"stop-color: "+i,offset:e,"stop-opacity":n})}function C(t,e,i,n){return L("svg",{className:e,inside:t,width:i,height:n})}function D(t){return L("defs",{inside:t})}function N(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,n={className:t,transform:e};return i&&(n.inside=i),L("g",n)}function S(t){return L("path",{className:arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",d:t,styles:{stroke:arguments.length>2&&void 0!==arguments[2]?arguments[2]:"none",fill:arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none","stroke-width":arguments.length>4&&void 0!==arguments[4]?arguments[4]:2}})}function E(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=i.x+t.x,o=i.y+t.y,l=i.x+e.x,u=i.y+e.y;return "M"+i.x+" "+i.y+"\n\t\tL"+r+" "+o+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z"}function _(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=i.x+t.x,o=i.y+t.y,l=i.x+e.x,u=2*i.y,h=i.y+e.y;return "M"+i.x+" "+i.y+"\n\t\tL"+r+" "+o+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z\n\t\tL"+r+" "+u+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+h+" z"}function z(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=i.x+t.x,o=i.y+t.y,l=i.x+e.x,u=i.y+e.y;return "M"+r+" "+o+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+u}function W(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=i.x+t.x,o=i.y+t.y,l=i.x+e.x,u=2*n+o,h=i.y+t.y;return "M"+r+" "+o+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+u+"\n\t\tM"+r+" "+u+"\n\t\tA "+n+" "+n+" 0 "+s+" "+(a?1:0)+"\n\t\t"+l+" "+h}function j(t,e){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n="path-fill-gradient-"+e+"-"+(i?"lighter":"default"),a=O(t,n),s=[1,.6,.2];return i&&(s=[.4,.2,0]),M(a,"0%",e,s[0]),M(a,"50%",e,s[1]),M(a,"100%",e,s[2]),n}function F(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:Jt,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none";return L("rect",{className:"percentage-bar",x:t,y:e,width:i,height:n,fill:s,styles:{stroke:A(s,-25),"stroke-dasharray":"0, "+(n+i)+", "+i+", "+n,"stroke-width":a}})}function H(t,e,i,n,a){var s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none",r=arguments.length>6&&void 0!==arguments[6]?arguments[6]:{},o={className:t,x:e,y:i,width:n,height:n,rx:a,fill:s};return Object.keys(r).map(function(t){o[t]=r[t];}),L("rect",o)}function I(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?b(a,se):a;var s={className:"legend-bar",x:0,y:0,width:i,height:"2px",fill:n},r=L("text",{className:"legend-dataset-text",x:0,y:0,dy:2*re+"px","font-size":1.2*re+"px","text-anchor":"start",fill:le,innerHTML:a}),o=L("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(L("rect",s)),o.appendChild(r),o}function R(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?b(a,se):a;var s={className:"legend-dot",cx:0,cy:0,r:i,fill:n},r=L("text",{className:"legend-dataset-text",x:0,y:0,dx:re+"px",dy:re/3+"px","font-size":1.2*re+"px","text-anchor":"start",fill:le,innerHTML:a}),o=L("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(L("circle",s)),o.appendChild(r),o}function Y(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},s=a.fontSize||re;return L("text",{className:t,x:e,y:i,dy:(void 0!==a.dy?a.dy:s/2)+"px","font-size":s+"px",fill:a.fill||le,"text-anchor":a.textAnchor||"start",innerHTML:n})}function B(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=oe);var s=L("line",{className:"line-vertical "+a.className,x1:0,x2:0,y1:i,y2:n,styles:{stroke:a.stroke}}),r=L("text",{x:0,y:i>n?i+ae:i-ae-re,dy:re+"px","font-size":re+"px","text-anchor":"middle",innerHTML:e+""}),o=L("g",{transform:"translate("+t+", 0)"});return o.appendChild(s),o.appendChild(r),o}function V(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=oe),a.lineType||(a.lineType=""),a.shortenNumbers&&(e=x(e));var s=L("line",{className:"line-horizontal "+a.className+("dashed"===a.lineType?"dashed":""),x1:i,x2:n,y1:0,y2:0,styles:{stroke:a.stroke}}),r=L("text",{x:i<n?i-ae:i+ae,y:0,dy:re/2-2+"px","font-size":re+"px","text-anchor":i<n?"end":"start",innerHTML:e+""}),o=L("g",{transform:"translate(0, "+t+")","stroke-opacity":1});return 0!==r&&"0"!==r||(o.style.stroke="rgba(27, 31, 35, 0.6)"),o.appendChild(s),o.appendChild(r),o}function U(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};f(t)||(t=0),n.pos||(n.pos="left"),n.offset||(n.offset=0),n.mode||(n.mode="span"),n.stroke||(n.stroke=oe),n.className||(n.className="");var a=-1*ne,s="span"===n.mode?i+ne:0;return "tick"===n.mode&&"right"===n.pos&&(a=i+ne,s=i),a+=n.offset,s+=n.offset,V(t,e,a,s,{stroke:n.stroke,className:n.className,lineType:n.lineType,shortenNumbers:n.shortenNumbers})}function G(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};f(t)||(t=0),n.pos||(n.pos="bottom"),n.offset||(n.offset=0),n.mode||(n.mode="span"),n.stroke||(n.stroke=oe),n.className||(n.className="");var a=i+ne,s="span"===n.mode?-1*ne:i;return "tick"===n.mode&&"top"===n.pos&&(a=-1*ne,s=0),B(t,e,a,s,{stroke:n.stroke,className:n.className,lineType:n.lineType})}function q(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};n.labelPos||(n.labelPos="right");var a=L("text",{className:"chart-label",x:"left"===n.labelPos?ae:i-d(e,5)-ae,y:0,dy:re/-2+"px","font-size":re+"px","text-anchor":"start",innerHTML:e+""}),s=V(t,"",0,i,{stroke:n.stroke||oe,className:n.className||"",lineType:n.lineType});return s.appendChild(a),s}function X(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},s=t-e,r=L("rect",{className:"bar mini",styles:{fill:"rgba(228, 234, 239, 0.49)",stroke:oe,"stroke-dasharray":i+", "+s},x:0,y:0,width:i,height:s});a.labelPos||(a.labelPos="right");var o=L("text",{className:"chart-label",x:"left"===a.labelPos?ae:i-d(n+"",4.5)-ae,y:0,dy:re/-2+"px","font-size":re+"px","text-anchor":"start",innerHTML:n+""}),l=L("g",{transform:"translate(0, "+e+")"});return l.appendChild(r),l.appendChild(o),l}function J(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=arguments.length>6&&void 0!==arguments[6]?arguments[6]:0,o=arguments.length>7&&void 0!==arguments[7]?arguments[7]:{},l=m(e,o.zeroLine),u=Vt(l,2),h=u[0],c=u[1];c-=r,0===h&&(h=o.minHeight,c-=o.minHeight),f(t)||(t=0),f(c)||(c=0),f(h,!0)||(h=0),f(i,!0)||(i=0);var d=L("rect",{className:"bar mini",style:"fill: "+n,"data-point-index":s,x:t,y:c,width:i,height:h});if((a+="")||a.length){d.setAttribute("y",0),d.setAttribute("x",0);var p=L("text",{className:"data-point-value",x:i/2,y:0,dy:re/2*-1+"px","font-size":re+"px","text-anchor":"middle",innerHTML:a}),v=L("g",{"data-point-index":s,transform:"translate("+t+", "+c+")"});return v.appendChild(d),v.appendChild(p),v}return d}function K(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,r=L("circle",{style:"fill: "+n,"data-point-index":s,cx:t,cy:e,r:i});if((a+="")||a.length){r.setAttribute("cy",0),r.setAttribute("cx",0);var o=L("text",{className:"data-point-value",x:0,y:0,dy:re/2*-1-i+"px","font-size":re+"px","text-anchor":"middle",innerHTML:a}),l=L("g",{"data-point-index":s,transform:"translate("+t+", "+e+")"});return l.appendChild(r),l.appendChild(o),l}return r}function $(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},s=e.map(function(e,i){return t[i]+","+e}).join("L");n.spline&&(s=k(t,e));var r=S("M"+s,"line-graph-path",i);if(n.heatline){var o=j(a.svgDefs,i);r.style.stroke="url(#"+o+")";}var l={path:r};if(n.regionFill){var u=j(a.svgDefs,i,!0),h="M"+t[0]+","+a.zeroLine+"L"+s+"L"+t.slice(-1)[0]+","+a.zeroLine;l.region=S(h,"region-fill","none","url(#"+u+")");}return l}function Q(t,e,i,n){var a="string"==typeof e?e:e.join(", ");return [t,{transform:i.join(", ")},n,ve,"translate",{transform:a}]}function Z(t,e,i){return Q(t,[i,0],[e,0],pe)}function tt(t,e,i){return Q(t,[0,i],[0,e],pe)}function et(t,e,i,n){var a=e-i,s=t.childNodes[0];return [[s,{height:a,"stroke-dasharray":s.getAttribute("width")+", "+a},pe,ve],Q(t,[0,n],[0,i],pe)]}function it(t,e,i,n){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,s=m(i,(arguments.length>5&&void 0!==arguments[5]?arguments[5]:{}).zeroLine),r=Vt(s,2),o=r[0],l=r[1];return l-=a,"rect"!==t.nodeName?[[t.childNodes[0],{width:n,height:o},ce,ve],Q(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,l],pe)]:[[t,{width:n,height:o,x:e,y:l},ce,ve]]}function nt(t,e,i){return "circle"!==t.nodeName?[Q(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,i],pe)]:[[t,{cx:e,cy:i},ce,ve]]}function at(t,e,i,n,a){var s=[],r=i.map(function(t,i){return e[i]+","+t}).join("L");a&&(r=k(e,i));var o=[t.path,{d:"M"+r},de,ve];if(s.push(o),t.region){var l=e[0]+","+n+"L",u="L"+e.slice(-1)[0]+", "+n,h=[t.region,{d:"M"+l+r+u},de,ve];s.push(h);}return s}function st(t,e){return [t,{d:e},ce,ve]}function rt(t,e,i){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"linear",a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{},r=t.cloneNode(!0),o=t.cloneNode(!0);for(var l in e){var u=void 0;u="transform"===l?document.createElementNS("http://www.w3.org/2000/svg","animateTransform"):document.createElementNS("http://www.w3.org/2000/svg","animate");var h=s[l]||t.getAttribute(l),c=e[l],d={attributeName:l,from:h,to:c,begin:"0s",dur:i/1e3+"s",values:h+";"+c,keySplines:ge[n],keyTimes:"0;1",calcMode:"spline",fill:"freeze"};a&&(d.type=a);for(var p in d)u.setAttribute(p,d[p]);r.appendChild(u),a?o.setAttribute(l,"translate("+c+")"):o.setAttribute(l,c);}return [r,o]}function ot(t,e){t.style.transform=e,t.style.webkitTransform=e,t.style.msTransform=e,t.style.mozTransform=e,t.style.oTransform=e;}function lt(t,e){var i=[],n=[];e.map(function(t){var e=t[0],a=e.parentNode,s=void 0,r=void 0;t[0]=e;var o=rt.apply(void 0,Ut(t)),l=Vt(o,2);s=l[0],r=l[1],i.push(r),n.push([s,a]),a&&a.replaceChild(s,e);});var a=t.cloneNode(!0);return n.map(function(t,n){t[1]&&(t[1].replaceChild(i[n],t[0]),e[n][0]=i[n]);}),a}function ut(t,e,i){if(0!==i.length){var n=lt(e,i);e.parentNode==t&&(t.removeChild(e),t.appendChild(n)),setTimeout(function(){n.parentNode==t&&(t.removeChild(n),t.appendChild(e));},fe);}}function ht(t,e){var i=document.createElement("a");i.style="display: none";var n=new Blob(e,{type:"image/svg+xml; charset=utf-8"}),a=window.URL.createObjectURL(n);i.href=a,i.download=t,document.body.appendChild(i),i.click(),setTimeout(function(){document.body.removeChild(i),window.URL.revokeObjectURL(a);},300);}function ct(e){var i=e.cloneNode(!0);i.classList.add("chart-container"),i.setAttribute("xmlns","http://www.w3.org/2000/svg"),i.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");var n=t.create("style",{innerHTML:me});i.insertBefore(n,i.firstChild);var a=t.create("div");return a.appendChild(i),a.innerHTML}function dt(t){var e=new Date(t);return e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),e}function pt(t){var e=t.getDate(),i=t.getMonth()+1;return [t.getFullYear(),(i>9?"":"0")+i,(e>9?"":"0")+e].join("-")}function ft(t){return new Date(t.getTime())}function vt(t,e){var i=xt(t);return Math.ceil(gt(i,e)/xe)}function gt(t,e){var i=we*ke;return (dt(e)-dt(t))/i}function mt(t,e){return t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear()}function yt(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=Ae[t];return e?i.slice(0,3):i}function bt(t,e){return new Date(e,t+1,0)}function xt(t){var e=ft(t),i=e.getDay();return 0!==i&&kt(e,-1*i),e}function kt(t,e){t.setDate(t.getDate()+e);}function wt(t,e,i){var n=Object.keys(Le).filter(function(e){return t.includes(e)}),a=Le[n[0]];return Object.assign(a,{constants:e,getData:i}),new Te(a)}function At(t){if(0===t)return [0,0];if(isNaN(t))return {mantissa:-6755399441055744,exponent:972};var e=t>0?1:-1;if(!isFinite(t))return {mantissa:4503599627370496*e,exponent:972};t=Math.abs(t);var i=Math.floor(Math.log10(t));return [e*(t/Math.pow(10,i)),i]}function Pt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=Math.ceil(t),n=Math.floor(e),a=i-n,s=a,r=1;a>5&&(a%2!=0&&(a=++i-n),s=a/2,r=2),a<=2&&(r=a/(s=4)),0===a&&(s=5,r=1);for(var o=[],l=0;l<=s;l++)o.push(n+r*l);return o}function Tt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=At(t),n=Vt(i,2),a=n[0],s=n[1],r=e?e/Math.pow(10,s):0,o=Pt(a=a.toFixed(6),r);return o=o.map(function(t){return t*Math.pow(10,s)})}function Lt(t){function e(t,e){for(var i=Tt(t),n=i[1]-i[0],a=0,s=1;a<e;s++)a+=n,i.unshift(-1*a);return i}var i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=Math.max.apply(Math,Ut(t)),a=Math.min.apply(Math,Ut(t)),s=[];if(n>=0&&a>=0)At(n)[1],s=i?Tt(n,a):Tt(n);else if(n>0&&a<0){var r=Math.abs(a);n>=r?(At(n)[1],s=e(n,r)):(At(r)[1],s=e(r,n).reverse().map(function(t){return -1*t}));}else if(n<=0&&a<=0){var o=Math.abs(a),l=Math.abs(n);At(o)[1],s=(s=i?Tt(o,l):Tt(o)).reverse().map(function(t){return -1*t});}return s}function Ot(t){var e=Mt(t);return t.indexOf(0)>=0?t.indexOf(0):t[0]>0?-1*t[0]/e:-1*t[t.length-1]/e+(t.length-1)}function Mt(t){return t[1]-t[0]}function Ct(t){return t[t.length-1]-t[0]}function Dt(t,e){return h(e.zeroLine-t*e.scaleMultiplier)}function Nt(t,e){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=e.reduce(function(e,i){return Math.abs(i-t)<Math.abs(e-t)?i:e},[]);return i?e.indexOf(n):n}function St(t,e){for(var i=Math.max.apply(Math,Ut(t)),n=1/(e-1),a=[],s=0;s<e;s++){var r=i*(n*s);a.push(r);}return a}function Et(t,e){return e.filter(function(e){return e<t}).length}function _t(t,e){t.labels=t.labels||[];var i=t.labels.length,n=t.datasets,a=new Array(i).fill(0);return n||(n=[{values:a}]),n.map(function(t){if(t.values){var n=t.values;n=(n=n.map(function(t){return isNaN(t)?0:t})).length>i?n.slice(0,i):c(n,i-n.length,0),t.values=n;}else t.values=a;t.chartType||(t.chartType=e);}),t.yRegions&&t.yRegions.map(function(t){if(t.end<t.start){var e=[t.end,t.start];t.start=e[0],t.end=e[1];}}),t}function zt(t){var e=t.labels.length,i=new Array(e).fill(0),n={labels:t.labels.slice(0,-1),datasets:t.datasets.map(function(t){return {name:"",values:i.slice(0,-1),chartType:t.chartType}})};return t.yMarkers&&(n.yMarkers=[{value:0,label:""}]),t.yRegions&&(n.yRegions=[{start:0,end:0,label:""}]),n}function Wt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=t/e.length;n<=0&&(n=1);var a=n/Kt,s=void 0;if(i){var r=Math.max.apply(Math,Ut(e.map(function(t){return t.length})));s=Math.ceil(r/a);}return e.map(function(t,e){return (t+="").length>a&&(i?e%s!=0&&(t=""):t=a-3>0?t.slice(0,a-3)+" ...":t.slice(0,a)+".."),t})}function jt(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"line",e=arguments[1],i=arguments[2];return "axis-mixed"===t?(i.type="line",new De(e,i)):Se[t]?new Se[t](e,i):void console.error("Undefined chart type: "+t)}!function(t,e){void 0===e&&(e={});var i=e.insertAt;if(t&&"undefined"!=typeof document){var n=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css","top"===i&&n.firstChild?n.insertBefore(a,n.firstChild):n.appendChild(a),a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t));}}('.chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ol,.graph-svg-tip ul{padding-left:0;display:-webkit-box;display:-ms-flexbox;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;-webkit-box-flex:1;-ms-flex:1;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:" ";border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}');var Ft="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Ht=(function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}),It=function(){function t(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n);}}return function(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}}(),Rt=function t(e,i,n){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,i);if(void 0===a){var s=Object.getPrototypeOf(e);return null===s?void 0:t(s,i,n)}if("value"in a)return a.value;var r=a.get;if(void 0!==r)return r.call(n)},Yt=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);},Bt=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e},Vt=function(){function t(t,e){var i=[],n=!0,a=!1,s=void 0;try{for(var r,o=t[Symbol.iterator]();!(n=(r=o.next()).done)&&(i.push(r.value),!e||i.length!==e);n=!0);}catch(t){a=!0,s=t;}finally{try{!n&&o.return&&o.return();}finally{if(a)throw s}}return i}return function(e,i){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,i);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),Ut=function(t){if(Array.isArray(t)){for(var e=0,i=Array(t.length);e<t.length;e++)i[e]=t[e];return i}return Array.from(t)};t.create=function(e,i){var n=document.createElement(e);for(var a in i){var s=i[a];if("inside"===a)t(s).appendChild(n);else if("around"===a){var r=t(s);r.parentNode.insertBefore(n,r),n.appendChild(r);}else "styles"===a?"object"===(void 0===s?"undefined":Ft(s))&&Object.keys(s).map(function(t){n.style[t]=s[t];}):a in n?n[a]=s:n.setAttribute(a,s);}return n};var Gt={margins:{top:10,bottom:10,left:20,right:20},paddings:{top:20,bottom:40,left:30,right:10},baseHeight:240,titleHeight:20,legendHeight:30,titleFontSize:12},qt=700,Jt=2,Kt=7,$t=["light-blue","blue","violet","red","orange","yellow","green","light-green","purple","magenta","light-grey","dark-grey"],Qt={bar:$t,line:$t,pie:$t,percentage:$t,heatmap:["#ebedf0","#c6e48b","#7bc96f","#239a3b","#196127"],donut:$t},Zt=Math.PI/180,te=function(){function e(t){var i=t.parent,n=void 0===i?null:i,a=t.colors,s=void 0===a?[]:a;Ht(this,e),this.parent=n,this.colors=s,this.titleName="",this.titleValue="",this.listValues=[],this.titleValueFirst=0,this.x=0,this.y=0,this.top=0,this.left=0,this.setup();}return It(e,[{key:"setup",value:function(){this.makeTooltip();}},{key:"refresh",value:function(){this.fill(),this.calcPosition();}},{key:"makeTooltip",value:function(){var e=this;this.container=t.create("div",{inside:this.parent,className:"graph-svg-tip comparison",innerHTML:'<span class="title"></span>\n\t\t\t\t<ul class="data-point-list"></ul>\n\t\t\t\t<div class="svg-pointer"></div>'}),this.hideTip(),this.title=this.container.querySelector(".title"),this.dataPointList=this.container.querySelector(".data-point-list"),this.parent.addEventListener("mouseleave",function(){e.hideTip();});}},{key:"fill",value:function(){var e=this,i=void 0;this.index&&this.container.setAttribute("data-point-index",this.index),i=this.titleValueFirst?"<strong>"+this.titleValue+"</strong>"+this.titleName:this.titleName+"<strong>"+this.titleValue+"</strong>",this.title.innerHTML=i,this.dataPointList.innerHTML="",this.listValues.map(function(i,n){var a=e.colors[n]||"black",s=0===i.formatted||i.formatted?i.formatted:i.value,r=t.create("li",{styles:{"border-top":"3px solid "+a},innerHTML:'<strong style="display: block;">'+(0===s||s?s:"")+"</strong>\n\t\t\t\t\t"+(i.title?i.title:"")});e.dataPointList.appendChild(r);});}},{key:"calcPosition",value:function(){var t=this.container.offsetWidth;this.top=this.y-this.container.offsetHeight-5,this.left=this.x-t/2;var e=this.parent.offsetWidth-t,i=this.container.querySelector(".svg-pointer");if(this.left<0)i.style.left="calc(50% - "+-1*this.left+"px)",this.left=0;else if(this.left>e){var n="calc(50% + "+(this.left-e)+"px)";i.style.left=n,this.left=e;}else i.style.left="50%";}},{key:"setValues",value:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1;this.titleName=i.name,this.titleValue=i.value,this.listValues=n,this.x=t,this.y=e,this.titleValueFirst=i.valueFirst||0,this.index=a,this.refresh();}},{key:"hideTip",value:function(){this.container.style.top="0px",this.container.style.left="0px",this.container.style.opacity="0";}},{key:"showTip",value:function(){this.container.style.top=this.top+"px",this.container.style.left=this.left+"px",this.container.style.opacity="1";}}]),e}(),ee={"light-blue":"#7cd6fd",blue:"#5e64ff",violet:"#743ee2",red:"#ff5858",orange:"#ffa00a",yellow:"#feef72",green:"#28a745","light-green":"#98d85b",purple:"#b554ff",magenta:"#ffa3ef",black:"#36114C",grey:"#bdd3e6","light-grey":"#f0f4f7","dark-grey":"#b8c2cc"},ie=function(t){return /rgb[a]{0,1}\([\d, ]+\)/gim.test(t)?/\D+(\d*)\D+(\d*)\D+(\d*)/gim.exec(t).map(function(t,e){return 0!==e?Number(t).toString(16):"#"}).reduce(function(t,e){return ""+t+e}):ee[t]||t},ne=6,ae=4,se=15,re=10,oe="#dadada",le="#555b51",ue={bar:function(t){var e=void 0;"rect"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var i=t.cloneNode();return i.style.fill="#000000",i.style.opacity="0.4",e&&i.setAttribute("transform",e),i},dot:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var i=t.cloneNode(),n=t.getAttribute("r"),a=t.getAttribute("fill");return i.setAttribute("r",parseInt(n)+4),i.setAttribute("fill",a),i.style.opacity="0.6",e&&i.setAttribute("transform",e),i},heat_square:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var i=t.cloneNode(),n=t.getAttribute("r"),a=t.getAttribute("fill");return i.setAttribute("r",parseInt(n)+4),i.setAttribute("fill",a),i.style.opacity="0.6",e&&i.setAttribute("transform",e),i}},he={bar:function(t,e){var i=void 0;"rect"!==t.nodeName&&(i=t.getAttribute("transform"),t=t.childNodes[0]);var n=["x","y","width","height"];Object.values(t.attributes).filter(function(t){return n.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),i&&e.setAttribute("transform",i);},dot:function(t,e){var i=void 0;"circle"!==t.nodeName&&(i=t.getAttribute("transform"),t=t.childNodes[0]);var n=["cx","cy"];Object.values(t.attributes).filter(function(t){return n.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),i&&e.setAttribute("transform",i);},heat_square:function(t,e){var i=void 0;"circle"!==t.nodeName&&(i=t.getAttribute("transform"),t=t.childNodes[0]);var n=["cx","cy"];Object.values(t.attributes).filter(function(t){return n.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),i&&e.setAttribute("transform",i);}},ce=350,de=350,pe=ce,fe=250,ve="easein",ge={ease:"0.25 0.1 0.25 1",linear:"0 0 1 1",easein:"0.1 0.8 0.2 1",easeout:"0 0 0.58 1",easeinout:"0.42 0 0.58 1"},me=".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}",ye=function(){function e(t,i){if(Ht(this,e),i=g(i),this.parent="string"==typeof t?document.querySelector(t):t,!(this.parent instanceof HTMLElement))throw new Error("No `parent` element to render on was provided.");this.rawChartArgs=i,this.title=i.title||"",this.type=i.type||"",this.realData=this.prepareData(i.data),this.data=this.prepareFirstData(this.realData),this.colors=this.validateColors(i.colors,this.type),this.config={showTooltip:1,showLegend:1,isNavigable:i.isNavigable||0,animate:void 0!==i.animate?i.animate:1,truncateLegends:i.truncateLegends||1},this.measures=JSON.parse(JSON.stringify(Gt));var n=this.measures;this.setMeasures(i),this.title.length||(n.titleHeight=0),this.config.showLegend||(n.legendHeight=0),this.argHeight=i.height||n.baseHeight,this.state={},this.options={},this.initTimeout=qt,this.config.isNavigable&&(this.overlays=[]),this.configure(i);}return It(e,[{key:"prepareData",value:function(t){return t}},{key:"prepareFirstData",value:function(t){return t}},{key:"validateColors",value:function(t,e){var i=[];return (t=(t||[]).concat(Qt[e])).forEach(function(t){var e=ie(t);P(e)?i.push(e):console.warn('"'+t+'" is not a valid color.');}),i}},{key:"setMeasures",value:function(){}},{key:"configure",value:function(){var t=this,e=this.argHeight;this.baseHeight=e,this.height=e-l(this.measures),this.boundDrawFn=function(){return t.draw(!0)},ResizeObserver&&(this.resizeObserver=new ResizeObserver(this.boundDrawFn),this.resizeObserver.observe(this.parent)),window.addEventListener("resize",this.boundDrawFn),window.addEventListener("orientationchange",this.boundDrawFn);}},{key:"destroy",value:function(){this.resizeObserver&&this.resizeObserver.disconnect(),window.removeEventListener("resize",this.boundDrawFn),window.removeEventListener("orientationchange",this.boundDrawFn);}},{key:"setup",value:function(){this.makeContainer(),this.updateWidth(),this.makeTooltip(),this.draw(!1,!0);}},{key:"makeContainer",value:function(){this.parent.innerHTML="";var e={inside:this.parent,className:"chart-container"};this.independentWidth&&(e.styles={width:this.independentWidth+"px"}),this.container=t.create("div",e);}},{key:"makeTooltip",value:function(){this.tip=new te({parent:this.container,colors:this.colors}),this.bindTooltip();}},{key:"bindTooltip",value:function(){}},{key:"draw",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];e&&i(this.parent)||(this.updateWidth(),this.calc(e),this.makeChartArea(),this.setupComponents(),this.components.forEach(function(e){return e.setup(t.drawArea)}),this.render(this.components,!1),n&&(this.data=this.realData,setTimeout(function(){t.update(t.data);},this.initTimeout)),this.renderLegend(),this.setupNavigation(n));}},{key:"calc",value:function(){}},{key:"updateWidth",value:function(){this.baseWidth=a(this.parent),this.width=this.baseWidth-u(this.measures);}},{key:"makeChartArea",value:function(){this.svg&&this.container.removeChild(this.svg);var t=this.measures;this.svg=C(this.container,"frappe-chart chart",this.baseWidth,this.baseHeight),this.svgDefs=D(this.svg),this.title.length&&(this.titleEL=Y("title",t.margins.left,t.margins.top,this.title,{fontSize:t.titleFontSize,fill:"#666666",dy:t.titleFontSize}));var e=r(t);this.drawArea=N(this.type+"-chart chart-draw-area","translate("+o(t)+", "+e+")"),this.config.showLegend&&(e+=this.height+t.paddings.bottom,this.legendArea=N("chart-legend","translate("+o(t)+", "+e+")")),this.title.length&&this.svg.appendChild(this.titleEL),this.svg.appendChild(this.drawArea),this.config.showLegend&&this.svg.appendChild(this.legendArea),this.updateTipOffset(o(t),r(t));}},{key:"updateTipOffset",value:function(t,e){this.tip.offset={x:t,y:e};}},{key:"setupComponents",value:function(){this.components=new Map;}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.calc(),this.render(this.components,this.config.animate),this.renderLegend();}},{key:"render",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.components,i=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.config.isNavigable&&this.overlays.map(function(t){return t.parentNode.removeChild(t)});var n=[];e.forEach(function(t){n=n.concat(t.update(i));}),n.length>0?(ut(this.container,this.svg,n),setTimeout(function(){e.forEach(function(t){return t.make()}),t.updateNav();},400)):(e.forEach(function(t){return t.make()}),this.updateNav());}},{key:"updateNav",value:function(){this.config.isNavigable&&(this.makeOverlay(),this.bindUnits());}},{key:"renderLegend",value:function(){}},{key:"setupNavigation",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.config.isNavigable&&e&&(this.bindOverlay(),this.keyActions={13:this.onEnterKey.bind(this),37:this.onLeftArrow.bind(this),38:this.onUpArrow.bind(this),39:this.onRightArrow.bind(this),40:this.onDownArrow.bind(this)},document.addEventListener("keydown",function(e){n(t.container)&&(e=e||window.event,t.keyActions[e.keyCode]&&t.keyActions[e.keyCode]());}));}},{key:"makeOverlay",value:function(){}},{key:"updateOverlay",value:function(){}},{key:"bindOverlay",value:function(){}},{key:"bindUnits",value:function(){}},{key:"onLeftArrow",value:function(){}},{key:"onRightArrow",value:function(){}},{key:"onUpArrow",value:function(){}},{key:"onDownArrow",value:function(){}},{key:"onEnterKey",value:function(){}},{key:"addDataPoint",value:function(){}},{key:"removeDataPoint",value:function(){}},{key:"getDataPoint",value:function(){}},{key:"setCurrentDataPoint",value:function(){}},{key:"updateDataset",value:function(){}},{key:"export",value:function(){var t=ct(this.svg);ht(this.title||"Chart",[t]);}}]),e}(),be=function(t){function e(t,i){return Ht(this,e),Bt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i))}return Yt(e,t),It(e,[{key:"configure",value:function(t){Rt(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.config.formatTooltipY=(t.tooltipOptions||{}).formatTooltipY,this.config.maxSlices=t.maxSlices||20,this.config.maxLegendPoints=t.maxLegendPoints||20;}},{key:"calc",value:function(){var t=this,e=this.state,i=this.config.maxSlices;e.sliceTotals=[];var n=this.data.labels.map(function(e,i){var n=0;return t.data.datasets.map(function(t){n+=t.values[i];}),[n,e]}).filter(function(t){return t[0]>=0}),a=n;if(n.length>i){n.sort(function(t,e){return e[0]-t[0]}),a=n.slice(0,i-1);var s=0;n.slice(i-1).map(function(t){s+=t[0];}),a.push([s,"Rest"]),this.colors[i-1]="grey";}e.labels=[],a.map(function(t){e.sliceTotals.push(v(t[0])),e.labels.push(t[1]);}),e.grandTotal=e.sliceTotals.reduce(function(t,e){return t+e},0),this.center={x:this.width/2,y:this.height/2};}},{key:"renderLegend",value:function(){var t=this,e=this.state;this.legendArea.textContent="",this.legendTotals=e.sliceTotals.slice(0,this.config.maxLegendPoints);var i=0,n=0;this.legendTotals.map(function(a,s){var r=150,o=Math.floor((t.width-u(t.measures))/r);t.legendTotals.length<o&&(r=t.width/t.legendTotals.length),i>o&&(i=0,n+=20);var l=r*i+5,h=t.config.truncateLegends?b(e.labels[s],r/10):e.labels[s],c=t.config.formatTooltipY?t.config.formatTooltipY(a):a,d=R(l,n,5,t.colors[s],h+": "+c,!1);t.legendArea.appendChild(d),i++;});}}]),e}(ye),xe=7,ke=1e3,we=86400,Ae=["January","February","March","April","May","June","July","August","September","October","November","December"],Pe=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],Te=function(){function t(e){var i=e.layerClass,n=void 0===i?"":i,a=e.layerTransform,s=void 0===a?"":a,r=e.constants,o=e.getData,l=e.makeElements,u=e.animateElements;Ht(this,t),this.layerTransform=s,this.constants=r,this.makeElements=l,this.getData=o,this.animateElements=u,this.store=[],this.labels=[],this.layerClass=n,this.layerClass="function"==typeof this.layerClass?this.layerClass():this.layerClass,this.refresh();}return It(t,[{key:"refresh",value:function(t){this.data=t||this.getData();}},{key:"setup",value:function(t){this.layer=N(this.layerClass,this.layerTransform,t);}},{key:"make",value:function(){this.render(this.data),this.oldData=this.data;}},{key:"render",value:function(t){var e=this;this.store=this.makeElements(t),this.layer.textContent="",this.store.forEach(function(t){e.layer.appendChild(t);}),this.labels.forEach(function(t){e.layer.appendChild(t);});}},{key:"update",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.refresh();var e=[];return t&&(e=this.animateElements(this.data)||[]),e}}]),t}(),Le={donutSlices:{layerClass:"donut-slices",makeElements:function(t){return t.sliceStrings.map(function(e,i){var n=S(e,"donut-path",t.colors[i],"none",t.strokeWidth);return n.style.transition="transform .3s;",n})},animateElements:function(t){return this.store.map(function(e,i){return st(e,t.sliceStrings[i])})}},pieSlices:{layerClass:"pie-slices",makeElements:function(t){return t.sliceStrings.map(function(e,i){var n=S(e,"pie-path","none",t.colors[i]);return n.style.transition="transform .3s;",n})},animateElements:function(t){return this.store.map(function(e,i){return st(e,t.sliceStrings[i])})}},percentageBars:{layerClass:"percentage-bars",makeElements:function(t){var e=this;return t.xPositions.map(function(i,n){return F(i,0,t.widths[n],e.constants.barHeight,e.constants.barDepth,t.colors[n])})},animateElements:function(t){if(t)return []}},yAxis:{layerClass:"y axis",makeElements:function(t){var e=this;return t.positions.map(function(i,n){return U(i,t.labels[n],e.constants.width,{mode:e.constants.mode,pos:e.constants.pos,shortenNumbers:e.constants.shortenNumbers})})},animateElements:function(t){var e=t.positions,i=t.labels,n=this.oldData.positions,a=this.oldData.labels,s=y(n,e),r=Vt(s,2);n=r[0],e=r[1];var o=y(a,i),l=Vt(o,2);return a=l[0],i=l[1],this.render({positions:n,labels:i}),this.store.map(function(t,i){return tt(t,e[i],n[i])})}},xAxis:{layerClass:"x axis",makeElements:function(t){var e=this;return t.positions.map(function(i,n){return G(i,t.calcLabels[n],e.constants.height,{mode:e.constants.mode,pos:e.constants.pos})})},animateElements:function(t){var e=t.positions,i=t.calcLabels,n=this.oldData.positions,a=this.oldData.calcLabels,s=y(n,e),r=Vt(s,2);n=r[0],e=r[1];var o=y(a,i),l=Vt(o,2);return a=l[0],i=l[1],this.render({positions:n,calcLabels:i}),this.store.map(function(t,i){return Z(t,e[i],n[i])})}},yMarkers:{layerClass:"y-markers",makeElements:function(t){var e=this;return t.map(function(t){return q(t.position,t.label,e.constants.width,{labelPos:t.options.labelPos,mode:"span",lineType:"dashed"})})},animateElements:function(t){var e=y(this.oldData,t),i=Vt(e,2);this.oldData=i[0];var n=(t=i[1]).map(function(t){return t.position}),a=t.map(function(t){return t.label}),s=t.map(function(t){return t.options}),r=this.oldData.map(function(t){return t.position});return this.render(r.map(function(t,e){return {position:r[e],label:a[e],options:s[e]}})),this.store.map(function(t,e){return tt(t,n[e],r[e])})}},yRegions:{layerClass:"y-regions",makeElements:function(t){var e=this;return t.map(function(t){return X(t.startPos,t.endPos,e.constants.width,t.label,{labelPos:t.options.labelPos})})},animateElements:function(t){var e=y(this.oldData,t),i=Vt(e,2);this.oldData=i[0];var n=(t=i[1]).map(function(t){return t.endPos}),a=t.map(function(t){return t.label}),s=t.map(function(t){return t.startPos}),r=t.map(function(t){return t.options}),o=this.oldData.map(function(t){return t.endPos}),l=this.oldData.map(function(t){return t.startPos});this.render(o.map(function(t,e){return {startPos:l[e],endPos:o[e],label:a[e],options:r[e]}}));var u=[];return this.store.map(function(t,e){u=u.concat(et(t,s[e],n[e],o[e]));}),u}},heatDomain:{layerClass:function(){return "heat-domain domain-"+this.constants.index},makeElements:function(t){var e=this,i=this.constants,n=i.index,a=i.colWidth,s=i.rowHeight,r=i.squareSize,o=i.radius,l=i.xTranslate,u=0;return this.serializedSubDomains=[],t.cols.map(function(t,i){1===i&&e.labels.push(Y("domain-name",l,-12,yt(n,!0).toUpperCase(),{fontSize:9})),t.map(function(t,i){if(t.fill){var n={"data-date":t.yyyyMmDd,"data-value":t.dataValue,"data-day":i},a=H("day",l,u,r,o,t.fill,n);e.serializedSubDomains.push(a);}u+=s;}),u=0,l+=a;}),this.serializedSubDomains},animateElements:function(t){if(t)return []}},barGraph:{layerClass:function(){return "dataset-units dataset-bars dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="bar",this.units=t.yPositions.map(function(i,n){return J(t.xPositions[n],i,t.barWidth,e.color,t.labels[n],n,t.offsets[n],{zeroLine:t.zeroLine,barsWidth:t.barsWidth,minHeight:e.minHeight})}),this.units},animateElements:function(t){var e=t.xPositions,i=t.yPositions,n=t.offsets,a=t.labels,s=this.oldData.xPositions,r=this.oldData.yPositions,o=this.oldData.offsets,l=this.oldData.labels,u=y(s,e),h=Vt(u,2);s=h[0],e=h[1];var c=y(r,i),d=Vt(c,2);r=d[0],i=d[1];var p=y(o,n),f=Vt(p,2);o=f[0],n=f[1];var v=y(l,a),g=Vt(v,2);l=g[0],a=g[1],this.render({xPositions:s,yPositions:r,offsets:o,labels:a,zeroLine:this.oldData.zeroLine,barsWidth:this.oldData.barsWidth,barWidth:this.oldData.barWidth});var m=[];return this.store.map(function(a,s){m=m.concat(it(a,e[s],i[s],t.barWidth,n[s],{zeroLine:t.zeroLine}));}),m}},lineGraph:{layerClass:function(){return "dataset-units dataset-line dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="dot",this.paths={},e.hideLine||(this.paths=$(t.xPositions,t.yPositions,e.color,{heatline:e.heatline,regionFill:e.regionFill,spline:e.spline},{svgDefs:e.svgDefs,zeroLine:t.zeroLine})),this.units=[],e.hideDots||(this.units=t.yPositions.map(function(i,n){return K(t.xPositions[n],i,t.radius,e.color,e.valuesOverPoints?t.values[n]:"",n)})),Object.values(this.paths).concat(this.units)},animateElements:function(t){var e=t.xPositions,i=t.yPositions,n=t.values,a=this.oldData.xPositions,s=this.oldData.yPositions,r=this.oldData.values,o=y(a,e),l=Vt(o,2);a=l[0],e=l[1];var u=y(s,i),h=Vt(u,2);s=h[0],i=h[1];var c=y(r,n),d=Vt(c,2);r=d[0],n=d[1],this.render({xPositions:a,yPositions:s,values:n,zeroLine:this.oldData.zeroLine,radius:this.oldData.radius});var p=[];return Object.keys(this.paths).length&&(p=p.concat(at(this.paths,e,i,t.zeroLine,this.constants.spline))),this.units.length&&this.units.map(function(t,n){p=p.concat(nt(t,e[n],i[n]));}),p}}},Oe=function(t){function i(t,e){Ht(this,i);var n=Bt(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,t,e));return n.type="percentage",n.setup(),n}return Yt(i,t),It(i,[{key:"setMeasures",value:function(t){var e=this.measures;this.barOptions=t.barOptions||{};var i=this.barOptions;i.height=i.height||20,i.depth=i.depth||Jt,e.paddings.right=30,e.legendHeight=60,e.baseHeight=8*(i.height+.5*i.depth);}},{key:"setupComponents",value:function(){var t=this.state,e=[["percentageBars",{barHeight:this.barOptions.height,barDepth:this.barOptions.depth},function(){return {xPositions:t.xPositions,widths:t.widths,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=wt.apply(void 0,Ut(t));return [t[0],e]}));}},{key:"calc",value:function(){var t=this;Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"calc",this).call(this);var e=this.state;e.xPositions=[],e.widths=[];var n=0;e.sliceTotals.map(function(i){var a=t.width*i/e.grandTotal;e.widths.push(a),e.xPositions.push(n),n+=a;});}},{key:"makeDataByIndex",value:function(){}},{key:"bindTooltip",value:function(){var t=this,i=this.state;this.container.addEventListener("mousemove",function(n){var a=t.components.get("percentageBars").store,s=n.target;if(a.includes(s)){var r=a.indexOf(s),o=e(t.container),l=e(s),u=l.left-o.left+parseInt(s.getAttribute("width"))/2,h=l.top-o.top,c=(t.formattedLabels&&t.formattedLabels.length>0?t.formattedLabels[r]:t.state.labels[r])+": ",d=i.sliceTotals[r]/i.grandTotal;t.tip.setValues(u,h,{name:c,value:(100*d).toFixed(1)+"%"}),t.tip.showTip();}});}}]),i}(be),Me=function(t){function i(t,e){Ht(this,i);var n=Bt(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,t,e));return n.type="pie",n.initTimeout=0,n.init=1,n.setup(),n}return Yt(i,t),It(i,[{key:"configure",value:function(t){Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1;}},{key:"calc",value:function(){var t=this;Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"calc",this).call(this);var e=this.state;this.radius=this.height>this.width?this.center.x:this.center.y;var n=this.radius,a=this.clockWise,s=e.slicesProperties||[];e.sliceStrings=[],e.slicesProperties=[];var r=180-this.config.startAngle;e.sliceTotals.map(function(i,o){var l=r,u=i/e.grandTotal*360,h=u>180?1:0,c=a?-u:u,d=r+=c,f=p(l,n),v=p(d,n),g=t.init&&s[o],m=void 0,y=void 0;t.init?(m=g?g.startPosition:f,y=g?g.endPosition:f):(m=f,y=v);var b=360===u?_(m,y,t.center,t.radius,a,h):E(m,y,t.center,t.radius,a,h);e.sliceStrings.push(b),e.slicesProperties.push({startPosition:f,endPosition:v,value:i,total:e.grandTotal,startAngle:l,endAngle:d,angle:c});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["pieSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=wt.apply(void 0,Ut(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,i=this.hoverRadio,n=p(t.startAngle+t.angle/2,e);return "translate3d("+n.x*i+"px,"+n.y*i+"px,0)"}},{key:"hoverSlice",value:function(t,i,n,a){if(t){var s=this.colors[i];if(n){ot(t,this.calTranslateByAngle(this.state.slicesProperties[i])),t.style.fill=A(s,50);var r=e(this.svg),o=a.pageX-r.left+10,l=a.pageY-r.top-10,u=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[i]:this.state.labels[i])+": ",h=(100*this.state.sliceTotals[i]/this.state.grandTotal).toFixed(1);this.tip.setValues(o,l,{name:u,value:h+"%"}),this.tip.showTip();}else ot(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.fill=s;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,i=this.components.get("pieSlices").store,n=this.curActiveSliceIndex,a=this.curActiveSlice;if(i.includes(e)){var s=i.indexOf(e);this.hoverSlice(a,n,!1),this.curActiveSlice=e,this.curActiveSliceIndex=s,this.hoverSlice(e,s,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),i}(be),Ce=function(t){function e(t,i){Ht(this,e);var n=Bt(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,i));n.type="heatmap",n.countLabel=i.countLabel||"";var a=["Sunday","Monday"],s=a.includes(i.startSubDomain)?i.startSubDomain:"Sunday";return n.startSubDomainIndex=a.indexOf(s),n.setup(),n}return Yt(e,t),It(e,[{key:"setMeasures",value:function(t){var e=this.measures;this.discreteDomains=0===t.discreteDomains?0:1,e.paddings.top=36,e.paddings.bottom=0,e.legendHeight=24,e.baseHeight=12*xe+l(e);var i=this.data,n=this.discreteDomains?12:0;this.independentWidth=12*(vt(i.start,i.end)+n)+u(e);}},{key:"updateWidth",value:function(){var t=this.discreteDomains?12:0,e=this.state.noOfWeeks?this.state.noOfWeeks:52;this.baseWidth=12*(e+t)+u(this.measures);}},{key:"prepareData",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data;if(t.start&&t.end&&t.start>t.end)throw new Error("Start date cannot be greater than end date.");if(t.start||(t.start=new Date,t.start.setFullYear(t.start.getFullYear()-1)),t.end||(t.end=new Date),t.dataPoints=t.dataPoints||{},parseInt(Object.keys(t.dataPoints)[0])>1e5){var e={};Object.keys(t.dataPoints).forEach(function(i){var n=new Date(i*ke);e[pt(n)]=t.dataPoints[i];}),t.dataPoints=e;}return t}},{key:"calc",value:function(){var t=this.state;t.start=ft(this.data.start),t.end=ft(this.data.end),t.firstWeekStart=ft(t.start),t.noOfWeeks=vt(t.start,t.end),t.distribution=St(Object.values(this.data.dataPoints),5),t.domainConfigs=this.getDomains();}},{key:"setupComponents",value:function(){var t=this,e=this.state,i=this.discreteDomains?0:1,n=e.domainConfigs.map(function(n,a){return ["heatDomain",{index:n.index,colWidth:12,rowHeight:12,squareSize:10,radius:t.rawChartArgs.radius||0,xTranslate:12*e.domainConfigs.filter(function(t,e){return e<a}).map(function(t){return t.cols.length-i}).reduce(function(t,e){return t+e},0)},function(){return e.domainConfigs[a]}.bind(t)]});this.components=new Map(n.map(function(t,e){var i=wt.apply(void 0,Ut(t));return [t[0]+"-"+e,i]}));var a=0;Pe.forEach(function(e,i){if([1,3,5].includes(i)){var n=Y("subdomain-name",-6,a,e,{fontSize:10,dy:8,textAnchor:"end"});t.drawArea.appendChild(n);}a+=12;});}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.draw(),this.bindTooltip();}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(e){t.components.forEach(function(i){var n=i.store,a=e.target;if(n.includes(a)){var s=a.getAttribute("data-value"),r=a.getAttribute("data-date").split("-"),o=yt(parseInt(r[1])-1,!0),l=t.container.getBoundingClientRect(),u=a.getBoundingClientRect(),h=parseInt(e.target.getAttribute("width")),c=u.left-l.left+h/2,d=u.top-l.top,p=s+" "+t.countLabel,f=" on "+o+" "+r[0]+", "+r[2];t.tip.setValues(c,d,{name:f,value:p,valueFirst:1},[]),t.tip.showTip();}});});}},{key:"renderLegend",value:function(){var t=this;this.legendArea.textContent="";var e=0,i=this.rawChartArgs.radius||0,n=Y("subdomain-name",e,12,"Less",{fontSize:11,dy:9});e=30,this.legendArea.appendChild(n),this.colors.slice(0,5).map(function(n,a){var s=H("heatmap-legend-unit",e+15*a,12,10,i,n);t.legendArea.appendChild(s);});var a=Y("subdomain-name",e+75+3,12,"More",{fontSize:11,dy:9});this.legendArea.appendChild(a);}},{key:"getDomains",value:function(){for(var t=this.state,e=[t.start.getMonth(),t.start.getFullYear()],i=e[0],n=e[1],a=[t.end.getMonth(),t.end.getFullYear()],s=a[0]-i+1+12*(a[1]-n),r=[],o=ft(t.start),l=0;l<s;l++){var u=t.end;if(!mt(o,t.end)){var h=[o.getMonth(),o.getFullYear()];u=bt(h[0],h[1]);}r.push(this.getDomainConfig(o,u)),kt(u,1),o=u;}return r}},{key:"getDomainConfig",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=[t.getMonth(),t.getFullYear()],n=i[0],a=i[1],s=xt(t),r={index:n,cols:[]};kt(e=ft(e)||bt(n,a),1);for(var o=vt(s,e),l=[],u=void 0,h=0;h<o;h++)u=this.getCol(s,n),l.push(u),kt(s=new Date(u[xe-1].yyyyMmDd),1);return void 0!==u[xe-1].dataValue&&(kt(s,1),l.push(this.getCol(s,n,!0))),r.cols=l,r}},{key:"getCol",value:function(t,e){for(var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=this.state,a=ft(t),s=[],r=0;r<xe;r++,kt(a,1)){var o={},l=a>=n.start&&a<=n.end;i||a.getMonth()!==e||!l?o.yyyyMmDd=pt(a):o=this.getSubDomainConfig(a),s.push(o);}return s}},{key:"getSubDomainConfig",value:function(t){var e=pt(t),i=this.data.dataPoints[e];return {yyyyMmDd:e,dataValue:i||0,fill:this.colors[Et(i,this.state.distribution)]}}}]),e}(ye),De=function(t){function i(t,e){Ht(this,i);var n=Bt(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,t,e));return n.barOptions=e.barOptions||{},n.lineOptions=e.lineOptions||{},n.type=e.type||"line",n.init=1,n.setup(),n}return Yt(i,t),It(i,[{key:"setMeasures",value:function(){this.data.datasets.length<=1&&(this.config.showLegend=0,this.measures.paddings.bottom=30);}},{key:"configure",value:function(t){Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"configure",this).call(this,t),t.axisOptions=t.axisOptions||{},t.tooltipOptions=t.tooltipOptions||{},this.config.xAxisMode=t.axisOptions.xAxisMode||"span",this.config.yAxisMode=t.axisOptions.yAxisMode||"span",this.config.xIsSeries=t.axisOptions.xIsSeries||0,this.config.shortenYAxisNumbers=t.axisOptions.shortenYAxisNumbers||0,this.config.formatTooltipX=t.tooltipOptions.formatTooltipX,this.config.formatTooltipY=t.tooltipOptions.formatTooltipY,this.config.valuesOverPoints=t.valuesOverPoints;}},{key:"prepareData",value:function(){return _t(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data,this.type)}},{key:"prepareFirstData",value:function(){return zt(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data)}},{key:"calc",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.calcXPositions(),t||this.calcYAxisParameters(this.getAllYValues(),"line"===this.type),this.makeDataByIndex();}},{key:"calcXPositions",value:function(){var t=this.state,e=this.data.labels;t.datasetLength=e.length,t.unitWidth=this.width/t.datasetLength,t.xOffset=t.unitWidth/2,t.xAxis={labels:e,positions:e.map(function(e,i){return h(t.xOffset+i*t.unitWidth)})};}},{key:"calcYAxisParameters",value:function(t){var e=Lt(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:"false"),i=this.height/Ct(e),n=Mt(e)*i,a=this.height-Ot(e)*n;this.state.yAxis={labels:e,positions:e.map(function(t){return a-t*i}),scaleMultiplier:i,zeroLine:a},this.calcDatasetPoints(),this.calcYExtremes(),this.calcYRegions();}},{key:"calcDatasetPoints",value:function(){var t=this.state,e=function(e){return e.map(function(e){return Dt(e,t.yAxis)})};t.datasets=this.data.datasets.map(function(t,i){var n=t.values,a=t.cumulativeYs||[];return {name:t.name&&t.name.replace(/<|>|&/g,function(t){return "&"==t?"&amp;":"<"==t?"&lt;":"&gt;"}),index:i,chartType:t.chartType,values:n,yPositions:e(n),cumulativeYs:a,cumulativeYPos:e(a)}});}},{key:"calcYExtremes",value:function(){var t=this.state;if(this.barOptions.stacked)return void(t.yExtremes=t.datasets[t.datasets.length-1].cumulativeYPos);t.yExtremes=new Array(t.datasetLength).fill(9999),t.datasets.map(function(e){e.yPositions.map(function(e,i){e<t.yExtremes[i]&&(t.yExtremes[i]=e);});});}},{key:"calcYRegions",value:function(){var t=this.state;this.data.yMarkers&&(this.state.yMarkers=this.data.yMarkers.map(function(e){return e.position=Dt(e.value,t.yAxis),e.options||(e.options={}),e})),this.data.yRegions&&(this.state.yRegions=this.data.yRegions.map(function(e){return e.startPos=Dt(e.start,t.yAxis),e.endPos=Dt(e.end,t.yAxis),e.options||(e.options={}),e}));}},{key:"getAllYValues",value:function(){var t,e=this,i="values";if(this.barOptions.stacked){i="cumulativeYs";var n=new Array(this.state.datasetLength).fill(0);this.data.datasets.map(function(t,a){var s=e.data.datasets[a].values;t[i]=n=n.map(function(t,e){return t+s[e]});});}var a=this.data.datasets.map(function(t){return t[i]});return this.data.yMarkers&&a.push(this.data.yMarkers.map(function(t){return t.value})),this.data.yRegions&&this.data.yRegions.map(function(t){a.push([t.end,t.start]);}),(t=[]).concat.apply(t,Ut(a))}},{key:"setupComponents",value:function(){var t=this,e=[["yAxis",{mode:this.config.yAxisMode,width:this.width,shortenNumbers:this.config.shortenYAxisNumbers},function(){return this.state.yAxis}.bind(this)],["xAxis",{mode:this.config.xAxisMode,height:this.height},function(){var t=this.state;return t.xAxis.calcLabels=Wt(this.width,t.xAxis.labels,this.config.xIsSeries),t.xAxis}.bind(this)],["yRegions",{width:this.width,pos:"right"},function(){return this.state.yRegions}.bind(this)]],i=this.state.datasets.filter(function(t){return "bar"===t.chartType}),n=this.state.datasets.filter(function(t){return "line"===t.chartType}),a=i.map(function(e){var n=e.index;return ["barGraph-"+e.index,{index:n,color:t.colors[n],stacked:t.barOptions.stacked,valuesOverPoints:t.config.valuesOverPoints,minHeight:0*t.height},function(){var t=this.state,e=t.datasets[n],a=this.barOptions.stacked,s=this.barOptions.spaceRatio||.5,r=t.unitWidth*(1-s),o=r/(a?1:i.length),l=t.xAxis.positions.map(function(t){return t-r/2});a||(l=l.map(function(t){return t+o*n}));var u=new Array(t.datasetLength).fill("");this.config.valuesOverPoints&&(u=a&&e.index===t.datasets.length-1?e.cumulativeYs:e.values);var h=new Array(t.datasetLength).fill(0);return a&&(h=e.yPositions.map(function(t,i){return t-e.cumulativeYPos[i]})),{xPositions:l,yPositions:e.yPositions,offsets:h,labels:u,zeroLine:t.yAxis.zeroLine,barsWidth:r,barWidth:o}}.bind(t)]}),s=n.map(function(e){var i=e.index;return ["lineGraph-"+e.index,{index:i,color:t.colors[i],svgDefs:t.svgDefs,heatline:t.lineOptions.heatline,regionFill:t.lineOptions.regionFill,spline:t.lineOptions.spline,hideDots:t.lineOptions.hideDots,hideLine:t.lineOptions.hideLine,valuesOverPoints:t.config.valuesOverPoints},function(){var t=this.state,e=t.datasets[i],n=t.yAxis.positions[0]<t.yAxis.zeroLine?t.yAxis.positions[0]:t.yAxis.zeroLine;return {xPositions:t.xAxis.positions,yPositions:e.yPositions,values:e.values,zeroLine:n,radius:this.lineOptions.dotSize||4}}.bind(t)]}),r=[["yMarkers",{width:this.width,pos:"right"},function(){return this.state.yMarkers}.bind(this)]];e=e.concat(a,s,r);var o=["yMarkers","yRegions"];this.dataUnitComponents=[],this.components=new Map(e.filter(function(e){return !o.includes(e[0])||t.state[e[0]]}).map(function(e){var i=wt.apply(void 0,Ut(e));return (e[0].includes("lineGraph")||e[0].includes("barGraph"))&&t.dataUnitComponents.push(i),[e[0],i]}));}},{key:"makeDataByIndex",value:function(){var t=this;this.dataByIndex={};var e=this.state,i=this.config.formatTooltipX,n=this.config.formatTooltipY;e.xAxis.labels.map(function(a,s){var r=t.state.datasets.map(function(e,i){var a=e.values[s];return {title:e.name,value:a,yPos:e.yPositions[s],color:t.colors[i],formatted:n?n(a):a}});t.dataByIndex[s]={label:a,formattedLabel:i?i(a):a,xPos:e.xAxis.positions[s],values:r,yExtreme:e.yExtremes[s]};});}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(i){var n=t.measures,a=e(t.container),s=i.pageX-a.left-o(n),l=i.pageY-a.top;l<t.height+r(n)&&l>r(n)?t.mapTooltipXPosition(s):t.tip.hideTip();});}},{key:"mapTooltipXPosition",value:function(t){var e=this.state;if(e.yExtremes){var i=Nt(t,e.xAxis.positions,!0);if(i>=0){var n=this.dataByIndex[i];this.tip.setValues(n.xPos+this.tip.offset.x,n.yExtreme+this.tip.offset.y,{name:n.formattedLabel,value:""},n.values,i),this.tip.showTip();}}}},{key:"renderLegend",value:function(){var t=this,e=this.data;e.datasets.length>1&&(this.legendArea.textContent="",e.datasets.map(function(e,i){var n=I(100*i,"0",100,t.colors[i],e.name,t.config.truncateLegends);t.legendArea.appendChild(n);}));}},{key:"makeOverlay",value:function(){var t=this;if(this.init)return void(this.init=0);this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);}),this.overlayGuides=this.dataUnitComponents.map(function(t){return {type:t.unitType,overlay:void 0,units:t.units}}),void 0===this.state.currentIndex&&(this.state.currentIndex=this.state.datasetLength-1),this.overlayGuides.map(function(e){var i=e.units[t.state.currentIndex];e.overlay=ue[e.type](i),t.drawArea.appendChild(e.overlay);});}},{key:"updateOverlayGuides",value:function(){this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);});}},{key:"bindOverlay",value:function(){var t=this;this.parent.addEventListener("data-select",function(){t.updateOverlay();});}},{key:"bindUnits",value:function(){var t=this;this.dataUnitComponents.map(function(e){e.units.map(function(e){e.addEventListener("click",function(){var i=e.getAttribute("data-point-index");t.setCurrentDataPoint(i);});});}),this.tip.container.addEventListener("click",function(){var e=t.tip.container.getAttribute("data-point-index");t.setCurrentDataPoint(e);});}},{key:"updateOverlay",value:function(){var t=this;this.overlayGuides.map(function(e){var i=e.units[t.state.currentIndex];he[e.type](i,e.overlay);});}},{key:"onLeftArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex-1);}},{key:"onRightArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex+1);}},{key:"getDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.currentIndex,e=this.state;return {index:t,label:e.xAxis.labels[t],values:e.datasets.map(function(e){return e.values[t]})}}},{key:"setCurrentDataPoint",value:function(t){var e=this.state;(t=parseInt(t))<0&&(t=0),t>=e.xAxis.labels.length&&(t=e.xAxis.labels.length-1),t!==e.currentIndex&&(e.currentIndex=t,s(this.parent,"data-select",this.getDataPoint()));}},{key:"addDataPoint",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.state.datasetLength;Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"addDataPoint",this).call(this,t,e,n),this.data.labels.splice(n,0,t),this.data.datasets.map(function(t,i){t.values.splice(n,0,e[i]);}),this.update(this.data);}},{key:"removeDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.datasetLength-1;this.data.labels.length<=1||(Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"removeDataPoint",this).call(this,t),this.data.labels.splice(t,1),this.data.datasets.map(function(e){e.values.splice(t,1);}),this.update(this.data));}},{key:"updateDataset",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.data.datasets[e].values=t,this.update(this.data);}},{key:"updateDatasets",value:function(t){this.data.datasets.map(function(e,i){t[i]&&(e.values=t[i]);}),this.update(this.data);}}]),i}(ye),Ne=function(t){function i(t,e){Ht(this,i);var n=Bt(this,(i.__proto__||Object.getPrototypeOf(i)).call(this,t,e));return n.type="donut",n.initTimeout=0,n.init=1,n.setup(),n}return Yt(i,t),It(i,[{key:"configure",value:function(t){Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1,this.strokeWidth=t.strokeWidth||30;}},{key:"calc",value:function(){var t=this;Rt(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"calc",this).call(this);var e=this.state;this.radius=this.height>this.width?this.center.x-this.strokeWidth/2:this.center.y-this.strokeWidth/2;var n=this.radius,a=this.clockWise,s=e.slicesProperties||[];e.sliceStrings=[],e.slicesProperties=[];var r=180-this.config.startAngle;e.sliceTotals.map(function(i,o){var l=r,u=i/e.grandTotal*360,h=u>180?1:0,c=a?-u:u,d=r+=c,f=p(l,n),v=p(d,n),g=t.init&&s[o],m=void 0,y=void 0;t.init?(m=g?g.startPosition:f,y=g?g.endPosition:f):(m=f,y=v);var b=360===u?W(m,y,t.center,t.radius,t.clockWise,h):z(m,y,t.center,t.radius,t.clockWise,h);e.sliceStrings.push(b),e.slicesProperties.push({startPosition:f,endPosition:v,value:i,total:e.grandTotal,startAngle:l,endAngle:d,angle:c});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["donutSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors,strokeWidth:this.strokeWidth}}.bind(this)]];this.components=new Map(e.map(function(t){var e=wt.apply(void 0,Ut(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,i=this.hoverRadio,n=p(t.startAngle+t.angle/2,e);return "translate3d("+n.x*i+"px,"+n.y*i+"px,0)"}},{key:"hoverSlice",value:function(t,i,n,a){if(t){var s=this.colors[i];if(n){ot(t,this.calTranslateByAngle(this.state.slicesProperties[i])),t.style.stroke=A(s,50);var r=e(this.svg),o=a.pageX-r.left+10,l=a.pageY-r.top-10,u=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[i]:this.state.labels[i])+": ",h=(100*this.state.sliceTotals[i]/this.state.grandTotal).toFixed(1);this.tip.setValues(o,l,{name:u,value:h+"%"}),this.tip.showTip();}else ot(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.stroke=s;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,i=this.components.get("donutSlices").store,n=this.curActiveSliceIndex,a=this.curActiveSlice;if(i.includes(e)){var s=i.indexOf(e);this.hoverSlice(a,n,!1),this.curActiveSlice=e,this.curActiveSliceIndex=s,this.hoverSlice(e,s,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),i}(be),Se={bar:De,line:De,percentage:Oe,heatmap:Ce,pie:Me,donut:Ne},Ee=function t(e,i){return Ht(this,t),jt(i.type,e,i)},_e=Object.freeze({Chart:Ee,PercentageChart:Oe,PieChart:Me,Heatmap:Ce,AxisChart:De}),ze={};return ze.NAME="Frappe Charts",ze.VERSION="1.6.2",ze=Object.assign({},ze,_e)});

    });

    /* node_modules/svelte-frappe-charts/src/components/base.svelte generated by Svelte v3.44.1 */
    const file$1 = "node_modules/svelte-frappe-charts/src/components/base.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$1, 89, 0, 2072);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[18](div);

    			if (!mounted) {
    				dispose = listen_dev(div, "data-select", /*data_select_handler*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[18](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Base', slots, []);

    	let { data = {
    		labels: [],
    		datasets: [{ values: [] }],
    		yMarkers: {},
    		yRegions: []
    	} } = $$props;

    	let { title = '' } = $$props;
    	let { type = 'line' } = $$props;
    	let { height = 300 } = $$props;
    	let { animate = true } = $$props;
    	let { axisOptions = {} } = $$props;
    	let { barOptions = {} } = $$props;
    	let { lineOptions = {} } = $$props;
    	let { tooltipOptions = {} } = $$props;
    	let { colors = [] } = $$props;
    	let { valuesOverPoints = 0 } = $$props;
    	let { isNavigable = false } = $$props;
    	let { maxSlices = 3 } = $$props;

    	/**
     *  COMPONENT
     */
    	//  The Chart returned from frappe
    	let chart = null;

    	//  DOM node for frappe to latch onto
    	let chartRef;

    	//  Helper HOF for calling a fn only if chart exists
    	function ifChartThen(fn) {
    		return function ifChart(...args) {
    			if (chart) {
    				return fn(...args);
    			}
    		};
    	}

    	const addDataPoint = ifChartThen((label, valueFromEachDataset, index) => chart.addDataPoint(label, valueFromEachDataset, index));
    	const removeDataPoint = ifChartThen(index => chart.removeDataPoint(index));
    	const exportChart = ifChartThen(() => chart.export());

    	//  Update the chart when incoming data changes
    	const updateChart = ifChartThen(newData => chart.update(newData));

    	/**
     *  Handle initializing the chart when this Svelte component mounts
     */
    	onMount(() => {
    		chart = new frappeCharts_min_umd.Chart(chartRef,
    		{
    				data,
    				title,
    				type,
    				height,
    				animate,
    				colors,
    				axisOptions,
    				barOptions,
    				lineOptions,
    				tooltipOptions,
    				valuesOverPoints,
    				isNavigable,
    				maxSlices
    			});
    	});

    	//  Mark Chart references for garbage collection when component is unmounted
    	onDestroy(() => {
    		chart = null;
    	});

    	const writable_props = [
    		'data',
    		'title',
    		'type',
    		'height',
    		'animate',
    		'axisOptions',
    		'barOptions',
    		'lineOptions',
    		'tooltipOptions',
    		'colors',
    		'valuesOverPoints',
    		'isNavigable',
    		'maxSlices'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Base> was created with unknown prop '${key}'`);
    	});

    	function data_select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chartRef = $$value;
    			$$invalidate(0, chartRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('height' in $$props) $$invalidate(4, height = $$props.height);
    		if ('animate' in $$props) $$invalidate(5, animate = $$props.animate);
    		if ('axisOptions' in $$props) $$invalidate(6, axisOptions = $$props.axisOptions);
    		if ('barOptions' in $$props) $$invalidate(7, barOptions = $$props.barOptions);
    		if ('lineOptions' in $$props) $$invalidate(8, lineOptions = $$props.lineOptions);
    		if ('tooltipOptions' in $$props) $$invalidate(9, tooltipOptions = $$props.tooltipOptions);
    		if ('colors' in $$props) $$invalidate(10, colors = $$props.colors);
    		if ('valuesOverPoints' in $$props) $$invalidate(11, valuesOverPoints = $$props.valuesOverPoints);
    		if ('isNavigable' in $$props) $$invalidate(12, isNavigable = $$props.isNavigable);
    		if ('maxSlices' in $$props) $$invalidate(13, maxSlices = $$props.maxSlices);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		Chart: frappeCharts_min_umd.Chart,
    		data,
    		title,
    		type,
    		height,
    		animate,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		chart,
    		chartRef,
    		ifChartThen,
    		addDataPoint,
    		removeDataPoint,
    		exportChart,
    		updateChart
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('height' in $$props) $$invalidate(4, height = $$props.height);
    		if ('animate' in $$props) $$invalidate(5, animate = $$props.animate);
    		if ('axisOptions' in $$props) $$invalidate(6, axisOptions = $$props.axisOptions);
    		if ('barOptions' in $$props) $$invalidate(7, barOptions = $$props.barOptions);
    		if ('lineOptions' in $$props) $$invalidate(8, lineOptions = $$props.lineOptions);
    		if ('tooltipOptions' in $$props) $$invalidate(9, tooltipOptions = $$props.tooltipOptions);
    		if ('colors' in $$props) $$invalidate(10, colors = $$props.colors);
    		if ('valuesOverPoints' in $$props) $$invalidate(11, valuesOverPoints = $$props.valuesOverPoints);
    		if ('isNavigable' in $$props) $$invalidate(12, isNavigable = $$props.isNavigable);
    		if ('maxSlices' in $$props) $$invalidate(13, maxSlices = $$props.maxSlices);
    		if ('chart' in $$props) chart = $$props.chart;
    		if ('chartRef' in $$props) $$invalidate(0, chartRef = $$props.chartRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 2) {
    			updateChart(data);
    		}
    	};

    	return [
    		chartRef,
    		data,
    		title,
    		type,
    		height,
    		animate,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		addDataPoint,
    		removeDataPoint,
    		exportChart,
    		data_select_handler,
    		div_binding
    	];
    }

    class Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			data: 1,
    			title: 2,
    			type: 3,
    			height: 4,
    			animate: 5,
    			axisOptions: 6,
    			barOptions: 7,
    			lineOptions: 8,
    			tooltipOptions: 9,
    			colors: 10,
    			valuesOverPoints: 11,
    			isNavigable: 12,
    			maxSlices: 13,
    			addDataPoint: 14,
    			removeDataPoint: 15,
    			exportChart: 16
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Base",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get data() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animate() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animate(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get axisOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set axisOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get barOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set barOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valuesOverPoints() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valuesOverPoints(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isNavigable() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNavigable(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSlices() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSlices(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addDataPoint() {
    		return this.$$.ctx[14];
    	}

    	set addDataPoint(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeDataPoint() {
    		return this.$$.ctx[15];
    	}

    	set removeDataPoint(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exportChart() {
    		return this.$$.ctx[16];
    	}

    	set exportChart(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Base$1 = Base;

    function fetchData(location, age) {
        console.log(age);
        return fetch(`/data/${location}_${age}.json`)
            .then(response => response.json())
            .then(json => ({
                labels: json.map(row => row.date).reverse(),
                datasets: [{values: json.map(row => row.incidence).reverse()}]
            }));
    }

    const locations = ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Bundesgebiet', 'Hamburg', 'Hessen',
    'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
    'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'];

    const ages = ['00+', '00-04', '05-14', '15-34', '35-59', '60-79', '80+'];

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (13:1) {#each locations as value}
    function create_each_block_1(ctx) {
    	let option;
    	let t0_value = /*value*/ ctx[8] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*value*/ ctx[8];
    			option.value = option.__value;
    			add_location(option, file, 13, 2, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(13:1) {#each locations as value}",
    		ctx
    	});

    	return block;
    }

    // (22:1) {#each ages as value}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*value*/ ctx[8] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = /*value*/ ctx[8];
    			option.value = option.__value;
    			add_location(option, file, 22, 2, 612);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:1) {#each ages as value}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Chart from 'svelte-frappe-charts';  import {fetchData, locations, ages}
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import Chart from 'svelte-frappe-charts';  import {fetchData, locations, ages}",
    		ctx
    	});

    	return block;
    }

    // (29:26)   <Chart title="Inzidenz in {location}
    function create_then_block(ctx) {
    	let chart;
    	let current;

    	chart = new Base$1({
    			props: {
    				title: "Inzidenz in " + /*location*/ ctx[0] + " Altersgruppe " + /*age*/ ctx[1],
    				data: /*data*/ ctx[7],
    				type: "line",
    				height: "800",
    				lineOptions: { dotSize: 3, regionFill: 1 },
    				axisOptions: { xIsSeries: true, xAxisMode: 'tick' }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chart, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chart_changes = {};
    			if (dirty & /*location, age*/ 3) chart_changes.title = "Inzidenz in " + /*location*/ ctx[0] + " Altersgruppe " + /*age*/ ctx[1];
    			if (dirty & /*promise*/ 4) chart_changes.data = /*data*/ ctx[7];
    			chart.$set(chart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(29:26)   <Chart title=\\\"Inzidenz in {location}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Chart from 'svelte-frappe-charts';  import {fetchData, locations, ages}
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>  import Chart from 'svelte-frappe-charts';  import {fetchData, locations, ages}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let label0;
    	let t1;
    	let select0;
    	let t2;
    	let label1;
    	let t4;
    	let select1;
    	let t5;
    	let await_block_anchor;
    	let promise_1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = locations;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = ages;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 7,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			label0.textContent = "Land/Gebiet";
    			t1 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			label1 = element("label");
    			label1.textContent = "Altersgruppe";
    			t4 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			await_block_anchor = empty();
    			info.block.c();
    			attr_dev(label0, "for", "location");
    			add_location(label0, file, 10, 0, 217);
    			attr_dev(select0, "name", "location");
    			if (/*location*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[3].call(select0));
    			add_location(select0, file, 11, 0, 259);
    			attr_dev(label1, "for", "age");
    			add_location(label1, file, 19, 0, 457);
    			attr_dev(select1, "name", "age");
    			if (/*age*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			add_location(select1, file, 20, 0, 495);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*location*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, label1, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, select1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*age*/ ctx[1]);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[3]),
    					listen_dev(select0, "change", /*change_handler*/ ctx[4], false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[5]),
    					listen_dev(select1, "change", /*change_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*locations*/ 0) {
    				each_value_1 = locations;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*location, locations*/ 1) {
    				select_option(select0, /*location*/ ctx[0]);
    			}

    			if (dirty & /*ages*/ 0) {
    				each_value = ages;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*age, ages*/ 2) {
    				select_option(select1, /*age*/ ctx[1]);
    			}

    			info.ctx = ctx;

    			if (dirty & /*promise*/ 4 && promise_1 !== (promise_1 = /*promise*/ ctx[2]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(label1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(select1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let location = 'Bundesgebiet';
    	let age = ages[0];
    	let promise = fetchData(location, age);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		location = select_value(this);
    		$$invalidate(0, location);
    	}

    	const change_handler = () => $$invalidate(2, promise = fetchData(location, age));

    	function select1_change_handler() {
    		age = select_value(this);
    		$$invalidate(1, age);
    	}

    	const change_handler_1 = () => $$invalidate(2, promise = fetchData(location, age));

    	$$self.$capture_state = () => ({
    		Chart: Base$1,
    		fetchData,
    		locations,
    		ages,
    		location,
    		age,
    		promise
    	});

    	$$self.$inject_state = $$props => {
    		if ('location' in $$props) $$invalidate(0, location = $$props.location);
    		if ('age' in $$props) $$invalidate(1, age = $$props.age);
    		if ('promise' in $$props) $$invalidate(2, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		location,
    		age,
    		promise,
    		select0_change_handler,
    		change_handler,
    		select1_change_handler,
    		change_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
