<template>
  <div>
    <input v-model="searchTerm"><button @click="filterSearch">filter</button>
    <br><br>
    <button @click="toggleExpandAll">expand all</button>
    <br><br>
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
            originalBookmarks: {},
            expandAll: true,
            searchTerm: "test"
        }
    },

    computed: {

    },

    methods: {
        filterSearch: function () {
            function copy(o) {
                return Object.assign({}, o)
            }

            var f = o => {
                var regex = new RegExp(this.searchTerm, "i")
                var isAvailable = false
                isAvailable = regex.test(o.title)

                if (o.title && isAvailable) {
                    return true
                }

                if (o.children) {
                    return (o.children = o.children.filter(f)).length
                }
            }

            var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))

            var res = [bookmarksCopy].map(copy).filter(f)

            this.bookmarks = res[0]
        },

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
            this.originalBookmarks = itemTree[0]
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

