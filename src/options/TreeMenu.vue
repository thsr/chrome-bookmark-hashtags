<template>
  <div class="tree-menu">

    <div class="title-wrapper" @click="toggleChildren">
      <div :style="indent" :class="titleClasses">
        <i v-if="node.children" class="fa" :class="iconClasses"></i>
        <span v-if="node.children">+ </span>
        {{ node.title }}
        <span v-if="node.url"> - <span class="url">{{ node.url }}</span></span>
      </div>
    </div>

    <tree-menu 
      v-if="showChildren || expandAll"
      v-for="child in node.children" 
      :node="child"
      :depth="depth + 1"
      :expandAll="expandAll"
      ></tree-menu>

  </div>

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
        'fa-plus-square-o': !this.showChildren,
        'fa-minus-square-o': this.showChildren
      }
    },
    titleClasses() {
      return { 'has-children': this.node.children }
    },
    indent() {
      return { transform: `translate(${this.depth * 50}px)` }
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

.url {
  width: 150px;
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-menu {
  .title-wrapper {
    border-bottom: 1px solid #ccc;
    .has-children {
      cursor: pointer;
    }
  }
}

</style>