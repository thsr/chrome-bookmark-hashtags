<template>
  <div>
    <form  @submit.prevent="filterSearch" action>
        <input v-model="searchTerm" placeholder="search in title...">
    </form>

    <br><br>
    <span v-for="tag in hashtags">{{tag.name}} &nbsp; </span>
    <form @submit.prevent="filterSearchTags" action>
        <input v-model="searchTermTags" placeholder="search in tags...">
    </form>

    <br><br>

    <button @click="toggleExpandAll">expand all</button>

    <br><br>

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
            searchTerm: "",
            searchTermTags: "",
            hashtags: []
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
                var regex = new RegExp(this.searchTerm, "gi")
                var isAvailable = false
                isAvailable = regex.test(o.title)

                if (o.title && isAvailable) { return true }
                if (o.children) { return (o.children = o.children.filter(f)).length }
            }

            var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))

            var res = [bookmarksCopy].filter(f)

            this.bookmarks = res[0]
        },

        filterSearchTags: function () {
            var f = o => {
                var regex = new RegExp(this.searchTerm, "gi")
                var isAvailable = false
                var stitchedTags = ""
                if (o.tags) stitchedTags = o.tags.join("\n")
                isAvailable = regex.test(stitchedTags)

                if (o.tags && isAvailable) { 
                    return true
                }
                if (o.children) { return (o.children = o.children.filter(f)).length }
            }

            var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))

            var res = [bookmarksCopy].filter(f)

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
            var bookmarks = []
            var hashtags = []

            var mapTags = o => {
                var res = o
                if (res.title) {
                    var foundTags = res.title.match(/#([^\s#]+)/gi)
                    if (foundTags && foundTags.length > -1) {
                        res.tags = foundTags
                        hashtags.push(...foundTags)
                    }
                }
                if (res.children) { res.children = res.children.map(mapTags) }
                return res
            }

            bookmarks = itemTree.map(mapTags)

            this.bookmarks = bookmarks[0]
            this.originalBookmarks = bookmarks[0]

            var hashtagCounts = {}
            for (var i = 0; i < hashtags.length; i++) {
                hashtagCounts[hashtags[i]] = 1 + (hashtagCounts[hashtags[i]] || 0);
            }
            hashtagCounts = Object.keys(hashtagCounts).map(function(key) {
              return {name: String(key), count: hashtagCounts[key]}
            });
            console.log(hashtagCounts)

            this.hashtags = hashtagCounts

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

