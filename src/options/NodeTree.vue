<template>
  <li class="node-tree">
    <span class="title">{{ node.title }}</span>
    <span class="url" v-if="node.url"><br>{{ node.url }}</span>

    <ul v-if="node.children && node.children.length" @click="showChildren">+
      <node v-if="showChildren" v-for="child in node.children" :node="child"></node>
    </ul>
  </li>
</template>

<script>
export default {
    name: "node",

    props: {
        node: Object
    },

    data () {
        return {
            showChildren: 0
        }
    },

    methods: {
        showChildren:  function () {
            this.showChildren = !this.showChildren
        }
    }
};
</script>