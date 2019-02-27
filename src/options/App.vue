<template>
  <div>
   <div class="hashtag-cloud">
        <div class="hashtag-list">
           <div v-for="tag in hashtagsAlphabetical" :style="tagSize(tag.count)" :class="{ selected: tag.selected }" @click="selectHashtag(tag)">
               <span>{{tag.name}}</span>
           </div>
       </div>
   </div>

    <div class="tools">
        <button @click="loadBookmarks">Reload</button>
        <button @click="toggleExpandAll">Expand All / Collapse All</button>
    </div>

    <div class="bookmarks">
        <tree-menu 
               :node="bookmarks" 
               :depth="0"
               :expandAll="expandAll"
               ></tree-menu>
    </div>
  </div>
</template>

<script>
import TreeMenu from "./TreeMenu"

export default {
    name: "App",

    components: {
        'tree-menu': TreeMenu
    },

    data () {
        return {
            bookmarks: {},
            originalBookmarks: {},
            expandAll: true,
            searchTerm: "",
            searchTermTags: "",
            hashtags: []
        }
    },

    computed: {
        hashtagsAlphabetical: function () {
            return this.hashtags.sort((a, b) => {
                  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }

                  // names must be equal
                  return 0;
            })
            
        },
        hashtagsSelected: function () {
            return this.hashtagsAlphabetical.filter((o) => {
                return o.selected == true
            })
        }
    },

    methods: {
        
        loadBookmarks: function () {
            chrome.bookmarks.getTree((itemTree) => {
                var bookmarks = []
                var hashtags = []

                //compute full tree
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

                //compute list of hashtags
                var hashtagCounts = {}
                for (var i = 0; i < hashtags.length; i++) {
                    hashtagCounts[hashtags[i]] = 1 + (hashtagCounts[hashtags[i]] || 0);
                }
                hashtagCounts = Object.keys(hashtagCounts).map(function(key) {
                    return {name: String(key), count: hashtagCounts[key], selected: false}
                });

                this.hashtags = hashtagCounts
            })
        },
        
        tagSize: function (counts) {
            return { 'font-size': `${counts * 100}%` }
        },

        selectHashtag: function (tag) {
            tag.selected = !tag.selected
            var hashtagsSelectedToSearch = this.hashtagsSelected.map(o => o.name)
            this.filterSearchTags(hashtagsSelectedToSearch)
        },
        filterSearch: function (search) {
            if (search == "") {
                var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))
                this.bookmarks = bookmarksCopy
                return
            }
            function f(o) {
                var regex = new RegExp(search, "gi")
                var isAvailable = false
                isAvailable = regex.test(o.title)

                if (o.title && isAvailable) { return true }
                if (o.children) { return (o.children = o.children.filter(f)).length }
            }
            var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))
            var res = [bookmarksCopy].filter(f)
            this.bookmarks = res[0]
        },

        filterSearchTags: function (searchArr) {
            if (searchArr.length == 0) {
                var bookmarksCopy = JSON.parse(JSON.stringify(this.originalBookmarks))
                this.bookmarks = bookmarksCopy
                return
            }

            function f(o) {

                searchArr = searchArr.map(o => "^" + o + "$")
                var regex = new RegExp(searchArr.join("|"), "i")
                var isAvailable = false
                if (o.tags) {
                    o.tags.map( (t) => {
                        isAvailable = isAvailable || regex.test(t)
                    })
                }

                if (o.tags) { 
                    return isAvailable
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
    },

    created: function () {
        this.loadBookmarks();
    },


}
</script>

<style scoped lang="scss">

.hashtag-cloud {
    display: block;
    text-align: center;

    .hashtag-list {
        margin: 0 auto 0;
        padding: 0;
        width: 800px;

        div {
            display: inline-block;
            vertical-align: bottom;
            margin-right: 5px;
        }
        div span {
            border-radius: 5px;
            padding: 3px;
            cursor: pointer;
            background: #eee;
        }

        div.selected span {
            background: #aaa !important;
        }
    }
}

.tools, .bookmarks {
    margin: 40px auto 0;
    padding: 0;
    width: 800px;
}

.bookmarks {
    ul:first-child {
        padding:0;
    }
}
</style>

