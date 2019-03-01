<template>
    <ul class="node">

        <li class="node" @click="toggleChildren" :class="hasChildren">

            <span v-if="node.children">&nbsp;<i class="fa" :class="faFolderOpenClose" aria-hidden="true"></i>&nbsp; </span>
            <span v-else><img class="favicon" :src="node.favicon"/> </span>
            <span class="name">{{ node.title }}</span>
            <span v-if="node.url"><br><span class="text-truncate"><a :href="node.url" target="_blank">{{ node.url }}</a></span></span>

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

        faFolderOpenClose() {
            return {
                'fa-folder': !this.showChildren && !this.expandAll,
                'fa-folder-open': this.showChildren || this.expandAll
            }
        },
        hasChildren() {
            return { 'has-children': this.node.children }
        },
    },
    methods: {
        toggleChildren() {
             this.showChildren = !this.showChildren;
        }
    }
};
</script>


<style scoped lang="scss">

ul.node {
    list-style-type: none;
}

.has-children {
    cursor: pointer;
    background: #eee;
}

li.node {
    vertical-align: middle;

    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    margin-bottom: -1px;
    padding: 5px;
    
    .name, .url {
        display: inline-block;
        vertical-align: middle;
        max-width: 500px;
        white-space: nowrap; 
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .url {
        font-size:80%;
        margin-left:10px;
    }


}

img.favicon {
    width:16px;
    height:16px;
}

</style>