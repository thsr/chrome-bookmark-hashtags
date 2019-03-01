<template>
<v-app>



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
    <v-toolbar color="yellow" app clipped-left>
      <!-- <v-toolbar-side-icon @click="navigation.drawer = !navigation.drawer"></v-toolbar-side-icon> -->
      <span class="title ml-3 mr-5">-&nbsp;<span class="font-weight-light">-</span></span>

      <v-spacer></v-spacer>

      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Search"
        prepend-inner-icon="search"
        ></v-text-field>

      <v-spacer></v-spacer>

      <v-btn @click="toggleExpandAll">expand all</v-btn>
    </v-toolbar>




    <!--=============================
    =            content            =
    ==============================-->
    <v-content fixed>
      <v-container fluid fill-height>
        <v-layout justify-center>
          <v-flex>
            <v-card>




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

                <v-divider dark class="my-3"></v-divider>

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
                      <img :src="item.favicon" v-else>
                    </template>

            <!--           <template slot="label" slot-scope="{ item }">
                      {{item.title}}
                    </template> -->

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
import TreeMenu from "./TreeMenu"

export default {
  name: "App",

  components: {
    'tree-menu': TreeMenu
  },

  data () {
    return {
      bookmarks: {
        expandAll: true,
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
  },

  methods: {
    loadBookmarks: function() {
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

    tagSize: function(counts) {
      return { 'font-size': `${counts * 100}%` }
    },

    selectHashtag: function(tag) {
      tag.selected = !tag.selected
      var hashtagsSelectedToSearch = this.hashtagsSelected.map(o => o.name)
      this.searchByHashtag(hashtagsSelectedToSearch)
    },

    filterSearch: function(search) {
      if (search == "") {
        var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))
        this.bookmarks.list = bookmarksCopy
        return
      }
      function f(o) {
        var regex = new RegExp(search, "gi")
        var isAvailable = false
        isAvailable = regex.test(o.title)

        if (o.title && isAvailable) { return true }
        if (o.children) { return (o.children = o.children.filter(f)).length }
      }
      var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))
      var res = [bookmarksCopy].filter(f)
      this.bookmarks.list = res[0]
    },

    searchByHashtag: function(searchArr) {
      if (searchArr.length == 0) {
        var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))
        this.bookmarks.list = bookmarksCopy
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
          return isAvailable
        }
        if (o.children) { return (o.children = o.children.filter(f)).length }
      }

      var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))
      var res = bookmarksCopy.filter(f)

      this.bookmarks.list = res
      this.$refs.treeview.updateAll(true)
    },

  },

  beforeMount: function () {
    this.loadBookmarks()
    this.loadHashtags()
  },


}
</script>

<style lang="styl">

/*// set these variables before Vuetify does*/
$body-font-family = Arial
$alert-font-size = 18px
/*Then, import _variables.styl so that you can override the nested values:*/

@import '~vuetify/src/stylus/settings/_variables'

/*// now that the $material-dark hash exists, set the background*/
$material-dark.background = 'green'
/*Then, import the main.styl so that the Vuetify CSS classes are created:*/

/*// import main to set all styles*/
@import '~vuetify/src/stylus/main'

/*// override the CSS classes using stylus variables*/
.display-2
  font-size: $headings.h6.size !important
  font-family: $headings.h3.font-family !important




</style>

