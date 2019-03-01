<template>

  <v-app>
    <v-card>
      <v-sheet class="pa-3 primary lighten-2">
        <v-text-field
          v-model="searchTerm"
          label="Search"
          dark
          flat
          solo-inverted
          hide-details
          clearable
          clear-icon="mdi-close-circle-outline"></v-text-field>
<!--         <v-checkbox
          v-model="caseSensitive"
          dark
          hide-details
          label="Case sensitive search"
        ></v-checkbox> -->
        <v-btn @click="toggleExpandAll">expand all</v-btn>
      </v-sheet>
      <v-card-text>
   <div class="hashtag-cloud">
      <v-chip v-for="tag in hashtagsAlphabetical" @click="selectHashtag(tag)">{{tag.name}}</v-chip>
   </div>

    <div class="tools">
        <v-btn @click="loadBookmarks">Reload</v-btn>
        <v-btn @click="toggleExpandAll">Expand All / Collapse All</v-btn>
    </div>

        <tree-menu 
               :node="bookmarks" 
               :depth="0"
               :expandAll="expandAll"
               ></tree-menu>

      </v-card-text>
    </v-card>
  </v-app>
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

                var mapTags = o => {
                    if (o.title) {
                        var foundTags = o.title.match(/#([^\s#]+)/gi)
                        if (foundTags && foundTags.length > -1) {
                            o.tags = foundTags
                        }
                    }
                    if (o.children) { o.children = o.children.map(mapTags) }
                    return o
                }
                var mapFavicons = o => {
                    if (o.url) {
                        o.favicon = this.favicon(o.url)
                    }
                    if (o.children) { o.children = o.children.map(mapFavicons) }
                    return o
                }
                bookmarks = itemTree.map(mapTags).map(mapFavicons)

                this.bookmarks = bookmarks[0]
                this.originalBookmarks = bookmarks[0]
            })
        },
        
        loadHashtags: function () {
            chrome.bookmarks.getTree((itemTree) => {
                var hashtags = []

                var generateFoundTags = o => {
                    if (o.title) {
                        var foundTags = o.title.match(/#([^\s#]+)/gi)
                        if (foundTags && foundTags.length > -1) {
                            hashtags.push(...foundTags)
                        }
                    }
                    if (o.children) { o.children = o.children.map(generateFoundTags) }
                    return o
                }
                itemTree.map(generateFoundTags)

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

        favicon: function(url) {
            var regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g
            var groups = regex.exec(url)
            var res = ''
            if (groups) {
                res = "chrome://favicon/https://" + groups[3]
            } else {
                res = "chrome://favicon"
            }
            return res

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

    beforeMount: function () {
        this.loadBookmarks()
        this.loadHashtags()
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
    /* width: 800px;*/
}

.bookmarks {
    ul:first-child {
        padding:0;
    }
}
</style>

