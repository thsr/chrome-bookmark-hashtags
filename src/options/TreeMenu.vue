<template>
  <ul class="node">

    <li class="label" @click="toggleChildren">
      <div :style="indent" :class="titleClasses">
        <span v-if="node.children"><i class="fa" :class="iconClasses" aria-hidden="true"></i> </span>
        <span v-else><i class="fa fa-file-o" aria-hidden="true"></i> </span>
        {{ node.title }}
        <span v-if="node.url"> <span class="url"><a :href="node.url" target="_blank"><!-- <i class="fa fa-external-link" aria-hidden="true"></i>  -->{{ node.url }}</a></span></span>
      </div>
    </li>

    <tree-menu 
      v-if="showChildren || expandAll"
      v-for="child in node.children" 
      :node="child"
      :depth="depth + 1"
      :expandAll="expandAll"
      ></tree-menu>

  </ul>

</template>

<script>
export default {
  name: 'tree-menu',
  props: [ 'node', 'depth', 'expandAll' ],
  data() {
     return {
       showChildren: false
     }
  },
  computed: {
    iconClasses() {
      return {
        'fa-folder': !this.showChildren && !this.expandAll,
        'fa-folder-open': this.showChildren || this.expandAll
      }
    },
    titleClasses() {
      return { 'has-children': this.node.children }
    },
    indent() {
      return true//{ transform: `translate(${this.depth * 50}px)` }
    }
  },
  methods: {
    toggleChildren() {
       this.showChildren = !this.showChildren;
    }
  }
};
</script>


<style lang="scss">

.container {
  width: 300px;
  margin: 0 auto;
}

ul.node {
  list-style-type: none;
}

.label {

  border-bottom: 1px solid #ccc;
  padding: 5px 0;

  .url {
    font-size:80%;
    display: inline-block;
    vertical-align: bottom;
    padding:0;
    margin:0;
    width: 450px;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .has-children {
    cursor: pointer;
  }
}


</style>