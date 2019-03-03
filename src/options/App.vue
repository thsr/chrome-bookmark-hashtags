<template>
<v-app>
<vue-progress-bar></vue-progress-bar>


    <!--=========================
    =            nav            =
    ==========================-->
<!--     <v-navigation-drawer v-model="navigation.drawer" app clipped disable-resize-watcher class="grey lighten-4">
      <v-list dense class="grey lighten-4">
        <template v-for="(item, i) in navigation.menu.items">

          <v-layout v-if="item.heading" :key="i" row align-center>
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-right">
              <v-btn small flat>edit</v-btn>
            </v-flex>
          </v-layout>

          <v-divider v-else-if="item.divider" :key="i" dark class="my-3"></v-divider>

          <v-list-tile v-else :key="i" @click="">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title class="grey--text">
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

        </template>
      </v-list>
    </v-navigation-drawer> -->



    <!--=============================
    =            toolbar            =
    ==============================-->
    <v-toolbar color="primary" dark app clipped-left>
      <!-- <v-toolbar-side-icon @click="navigation.drawer = !navigation.drawer"></v-toolbar-side-icon> -->
      <span class="title ml-3 mr-5">-&nbsp;<span class="font-weight-light">-</span></span>

      <v-spacer></v-spacer>


      <v-text-field
        @keyup.enter="searchByTitle(searchTerm)"
        v-model="searchTerm"
        @click:clear="searchByTitle('')"
        clearable
        solo-inverted
        flat
        hide-details
        label="Search bookmark title"
        prepend-inner-icon="search"
        ></v-text-field>

      <v-spacer></v-spacer>
    </v-toolbar>




    <!--=============================
    =            content            =
    ==============================-->
    <v-content fixed>
      <v-container>
        <v-layout justify-center>
          <v-flex>
            <v-card>





                <!--=====================================
                =            bookmarks tools            =
                =======================================-->
                <v-toolbar dense flat>
                  <v-btn flat @click="toggleExpandAll" style="width:170px;">
                    {{expandAllText}}
                    <v-icon right v-if="bookmarks.expandAll">expand_less</v-icon>
                    <v-icon right v-else>expand_more</v-icon>
                  </v-btn>

                  <v-divider vertical></v-divider>

                  <v-btn flat @click="refresh" style="width:170px;">
                    Refresh
                    <v-icon right>refresh</v-icon>
                  </v-btn>
                </v-toolbar>







                <!--==========================:style="tagSize(tag.count)" style="margin-right:.5em;"
                =            tags            =
                ===========================-->
                <v-card-text>
                  <v-chip 
                    v-for="tag in hashtagsAlphabetical"
                    :key="tag.name"
                    :selected="tag.selected"
                    @click="selectHashtag(tag)"
                    >
                    {{tag.name}}
                  </v-chip>
                </v-card-text>







                <!--==============================
                =            treeview            =
                ===============================-->
                <v-card-text>
                  <v-treeview ref="treeview"
                    open-on-click
                    :items="bookmarks.list"
                    item-text="title">

                    <template slot="prepend" slot-scope="{ item, open }">
                      <v-icon v-if="item.children">
                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                      </v-icon>
                      <a :href="item.url" target="_blank" v-else><img :src="item.favicon"></a>
                    </template>

                    <template slot="label" slot-scope="{ item }" >
                      <!-- <span @click="item.url ? openInNewWindow(item.url) : null"> -->
                        <a v-if="item.url" :href="item.url" target="_blank" class="">{{item.title}}</a>
                        <span v-else>{{item.title}}</span>
                        <a :href="item.url" target="_blank" class="body-2 font-weight-light">{{item.url}}</a>
                      <!--  -->
                    </template>

                  </v-treeview>
                </v-card-text>




            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>


</v-app>
</template>

<script>
// import TreeMenu from "./TreeMenu"

export default {
  name: "App",

  // components: {
  //   'tree-menu': TreeMenu
  // },

  data () {
    return {
      bookmarks: {
        expandAll: false,
        list: [],
        original: [],
      },
      hashtags: {
        list:[],
      },
      searchTerm: "",
      searchTermTags: "",
      navigation: {
        drawer: null,
        menu: {
          items: [
            { icon: 'lightbulb_outline', text: 'Notes' },
            { icon: 'touch_app', text: 'Reminders' },
            { divider: true },
            { heading: 'Labels' },
            { icon: 'add', text: 'Create new label' },
            { divider: true },
            { icon: 'archive', text: 'Archive' },
            { icon: 'delete', text: 'Trash' },
            { divider: true },
            { icon: 'settings', text: 'Settings' },
            { icon: 'chat_bubble', text: 'Trash' },
            { icon: 'help', text: 'Help' },
            { icon: 'phonelink', text: 'App downloads' },
            { icon: 'keyboard', text: 'Keyboard shortcuts' }
          ],
        }
      },
    }
  },

  computed: {
    hashtagsAlphabetical: function() {
      return this.hashtags.list.sort((a, b) => {
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase()
        if (nameA < nameB) {
          return -1
        } else if (nameA > nameB) {
          return 1
        }
        return 0
      })
    },

    hashtagsSelected: function() {
      return this.hashtagsAlphabetical.filter((o) => {
        return o.selected == true
      })
    },

    expandAllText: function() {
      return this.bookmarks.expandAll ? "Collapse All" : "Expand All"
      // return "Show All"
    },
  },

  methods: {
    loadBookmarks: function() {
        this.$Progress.start()
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
        this.bookmarks.list = bookmarks
        this.bookmarks.original = bookmarks
        this.$Progress.finish()
      })
    },
    
    loadHashtags: function() {
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
        })
        this.hashtags.list = hashtagCounts
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
    
    toggleExpandAll: function(node) {
      this.bookmarks.expandAll = !this.bookmarks.expandAll
      this.$refs.treeview.updateAll(this.bookmarks.expandAll)
    },
    
    refresh: function(node) {
      this.loadHashtags()
      this.loadBookmarks()
    },

    tagSize: function(counts) {
      return { 'font-size': `${counts * 100}%` }
    },

    openInNewWindow: function(url) {   
        window.open(url, "_blank");    
    },

    selectHashtag: function(tag) {
      tag.selected = !tag.selected
      var hashtagsSelectedToSearch = this.hashtagsSelected.map(o => o.name)
      this.searchByHashtag(hashtagsSelectedToSearch)
    },

    searchByTitle: function(search) {
      this.$Progress.start()
      function f(o) {
        var regex = new RegExp(search, "gi")
        var isAvailable = false
        isAvailable = regex.test(o.title)

        if (o.title && isAvailable) { return true }
        if (o.children) { return (o.children = o.children.filter(f)).length }
      }

      var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))

      if (search.length == "") {
        var res = bookmarksCopy
      } else {
        var res = bookmarksCopy.filter(f)
      }

      this.bookmarks.list = res
      this.bookmarks.expandAll = true
      this.$refs.treeview.updateAll(this.bookmarks.expandAll)
      this.$Progress.finish()
    },

    searchByHashtag: function(searchArr) {
      this.$Progress.start()
      function f(o) {
        searchArr = searchArr.map(o => "^" + o + "$")
        var regex = new RegExp(searchArr.join("|"), "i")
        var isAvailable = false
        if (o.tags) {
          o.tags.map( (t) => {
            isAvailable = isAvailable || regex.test(t)
          })
          return isAvailable
        }
        if (o.children) {
          return (o.children = o.children.filter(f)).length
        }
      }

      var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))

      if (searchArr.length == 0) {
        var res = bookmarksCopy
      } else {
        var res = bookmarksCopy.filter(f)
      }

      this.bookmarks.list = res
      this.bookmarks.expandAll = true
      this.$refs.treeview.updateAll(this.bookmarks.expandAll)
      this.$Progress.finish()
    },

  },

  beforeMount: function () {
    this.loadBookmarks()
    this.loadHashtags()
  },

  mounted: function () {
  },


}
</script>

<style lang="scss">
.__cov-progress {
  opacity: 1;
  z-index: 999999;
}
body {
font-size:80% !important;
}
.v-treeview-node {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/*.v-treeview-node--leaf>.v-treeview-node__root,
.v-treeview-node--leaf>.v-treeview-node__root>.v-treeview-node__content>*:not(.cursor-pointer):not(a) {
  cursor: default !important;
}

.cursor-pointer {
  cursor: pointer !important;
}*/
</style>

