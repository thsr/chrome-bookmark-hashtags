<template>
  <div>
    <button @click="toggleExpandAll">expand all</button>
    <!-- <tree :tree-data="bookmarks"></tree> -->
    <tree-menu 
           :node="bookmarks" 
           :depth="0"
           :expandAll="expandAll"
           ></tree-menu>
  </div>
</template>

<script>
import Tree from "./Tree"
import TreeMenu from "./TreeMenu"

export default {
    name: "App",

    components: {
        'tree': Tree,
        'tree-menu': TreeMenu
    },

    data () {
        return {
            tree: {
                title: "A cool folder",
                children: [
                    {
                        title: "A cool sub-folder 1",
                        children: [
                        { title: "A cool sub-sub-folder 1" },
                        { title: "A cool sub-sub-folder 2" }
                        ]
                    },
                    { title: "This one is not that cool" }
                ]
            },
            bookmarks: {},
            expandAll: 0
        }
    },

    methods: {
        toggleExpandAll: function (node) {
            this.expandAll = !this.expandAll
        }
        // processNode: function (node) {
        //     // recursively process child nodes

        //     if (node.children) {
        //         node.children.forEach((child) => { this.processNode(child) })
        //     }
        //     // print leaf nodes URLs to console
        //     if (node.url) {
        //         // console.log(node.url)
        //         // this.bookmarks.label = node.url
        //         // this.bookmarks.children = []
        //         // this.bookmarks.children.push( {label: node.url})
        //     }
        // }
    },

    created: function () {
        chrome.bookmarks.getTree((itemTree) => {
            this.bookmarks = itemTree[0]
            console.log(itemTree[0])

            // itemTree.forEach((item) => {
            //     this.processNode(item);
            // })
        })
    },


}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>

