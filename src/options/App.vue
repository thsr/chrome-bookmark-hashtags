<template>
<v-app>
<vue-progress-bar></vue-progress-bar>



    <!--=============================
    =            toolbar            =
    ==============================-->
    <v-toolbar color="primary" dark app clipped-left>
      <span class="title ml-3 mr-5">Hashtags&nbsp;<span class="font-weight-light">for Chrome&nbsp;bookmarks</span></span>

      <v-spacer></v-spacer>

      <!--================================
      =            search bar            =
      =================================-->
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
      
        <v-btn
          :flat="!(navigation.tab === 'treeView')"
          :color="(navigation.tab === 'treeView') ? 'secondary' : ''" 
          @click="navigation.tab = 'treeView'">
          View by folder
        </v-btn>

        <v-btn
          :flat="!(navigation.tab === 'historicalView')"
          :color="(navigation.tab === 'historicalView') ? 'secondary' : ''" 
          @click="navigation.tab = 'historicalView'">
          View by date added
        </v-btn>
      

      <!--==================================
      =            about dialog            =
      ===================================-->
      <v-dialog
        v-model="dialog.about"
        width="500"
        class="body-1">
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on">
            <v-icon>info</v-icon>
          </v-btn>
        </template>
  
        <v-card>
          <v-card-text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </v-card-text>
        </v-card>
      </v-dialog>

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

                  <v-btn flat @click="refresh">
                    Refresh
                    <v-icon right>refresh</v-icon>
                  </v-btn>

                  <v-divider vertical></v-divider>

                  <v-btn flat @click="doExpandAll" v-if="navigation.tab === 'treeView'">
                    Expand All
                  </v-btn>

                  <v-btn flat @click="doCollapseAll" v-if="navigation.tab === 'treeView'">
                    Collapse All
                  </v-btn>
                </v-toolbar>




                <!--==========================
                =            tags            =
                ===========================-->
<!--                     :style="tag.selected ? {'color': 'white'} : {}" -->
                <v-card-text>
                  <div
                    class="tag-chip"
                    v-for="tag in hashtagsAlphabetical"
                    :key="tag.name"
                    :class="{'secondary': tag.selected}"
                    @click="selectHashtag(tag)"
                    >
                    <span :class="tagSize(tag.count)">{{tag.name}}</span> <span class="caption">&nbsp;({{tag.count}})</span>
                  </div>
                </v-card-text>





                <!--==============================
                =            treeview            =
                ===============================-->
                <v-card-text v-if="navigation.tab === 'treeView'">
                  <v-treeview ref="treeview"
                    open-on-click
                    :items="bookmarks.list"
                    item-text="title">

                    <template slot="prepend" slot-scope="{ item, open }">
                      <v-icon v-if="item.children">
                        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
                      </v-icon>
                      <a :href="item.url" target="_blank" v-else><img class="favicon" :src="item.favicon"></a>
                    </template>

                    <template slot="label" slot-scope="{ item }" >
                        <a v-if="item.url" :href="item.url" target="_blank" class="">{{item.title}}</a>
                        <span v-else>{{item.title}}</span>
                        <a :href="item.url" target="_blank" class="body-2 font-weight-light">{{item.url}}</a>
                    </template>

                  </v-treeview>
                </v-card-text>






                <!--=====================================
                =            historical view            =
                ======================================-->
                <div v-if="navigation.tab !== 'treeView'">
                  <v-list dense>
                    <v-list-tile v-for="item in bookmarksHistoricalSorted" :key="item.id">
                      <v-list-tile-avatar>
                        <a :href="item.url" target="_blank"><img class="favicon" :src="item.favicon"></a>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <span>
                          <a :href="item.url" target="_blank" class="bookmark-title">{{item.title}}</a>
                          <a :href="item.url" target="_blank" class="bookmark-url font-weight-light">{{item.url}}</a>
                        </span>
                      </v-list-tile-content>
                    </v-list-tile>
                  </v-list>
                </div>




            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>


</v-app>
</template>

<script>
// import TreeMenu from "./TreeMenu"
// import { pick } from 'lodash'

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
        historical: []
      },
      hashtags: {
        list:[],
      },
      searchTerm: "",
      searchTermTags: "",

      navigation: {
        tab: 'historicalView'
      },
      dialog: {
        about: false
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

    bookmarksHistoricalSorted: function() {
      var res = []
      var mapHistorical = o => {
        if (o.url) {
          res.push(o)
        }
        if (o.children) { o.children = o.children.map(mapHistorical) }
        return o
      }
      this.bookmarks.list.map(mapHistorical)
      res = res.sort((a, b) => {
        return b.dateAdded - a.dateAdded
      })
      return res
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
        // var mapPick = o => {
        //   if (o.children) { o.children = o.children.map(mapPick) }
        //   var res = pick(o, ['id', 'title', 'url', 'children', 'dateAdded', 'tags', 'favicon'])
        //   res = JSON.parse(JSON.stringify(res))
        //   return res
        // }

        bookmarks = itemTree.map(mapTags).map(mapFavicons)   //.map(mapPick)
        this.bookmarks.list = bookmarks
        this.bookmarks.original = bookmarks
        this.$Progress.finish()
      })
    },
    
    loadHashtags: function() {
      chrome.bookmarks.getTree((itemTree) => {
        var hashtags = []

        function generateFoundTags(o) {
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
      var regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?((www\.)?[^:\/?\n]+)/g
      var groups = regex.exec(url)
      var res = ''
      if (groups) {
        res = "chrome://favicon/https://" + groups[1]
      } else {
        res = "chrome://favicon"
      }
      return res
    },
    
    toggleExpandAll: function(node) {
      this.bookmarks.expandAll = !this.bookmarks.expandAll
      if (this.navigation.tab === 'treeView') this.$refs.treeview.updateAll(this.bookmarks.expandAll)
    },
    
    doExpandAll: function(node) {
      this.bookmarks.expandAll = true
      if (this.navigation.tab === 'treeView') this.$refs.treeview.updateAll(this.bookmarks.expandAll)
    },
    
    doCollapseAll: function(node) {
      this.bookmarks.expandAll = false
      if (this.navigation.tab === 'treeView') this.$refs.treeview.updateAll(this.bookmarks.expandAll)
    },
    
    refresh: function(node) {
      this.loadHashtags()
      this.loadBookmarks()
    },

    tagSize: function(count) {
      var allCounts = this.hashtags.list.map(o => o.count)
      var minCount = Math.min(...allCounts)
      var maxCount = Math.max(...allCounts)
      var res = ''
      if (count < ((maxCount - minCount) * 1 / 5) + minCount) {res = ''}
      else if (count < ((maxCount - minCount) * 2 / 5) + minCount) {res = 'subheading'}
      else if (count < ((maxCount - minCount) * 3 / 5) + minCount) {res = 'title'}
      else if (count < ((maxCount - minCount) * 4 / 5) + minCount) {res = 'headline'}
      else {res = 'display-1'}
      return res
    },

    selectHashtag: function(tag) {
      tag.selected = !tag.selected
      var hashtagsSelectedToSearch = this.hashtagsSelected.map(o => o.name)
      this.searchByHashtagAlt(hashtagsSelectedToSearch)
      
    },

    deselectAllHashtags: function() {
      this.hashtags.list.map(o => o.selected = false)
    },

    searchByTitle: function(search) {
      this.$Progress.start()
      this.deselectAllHashtags()

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
      setTimeout( () => {
        if (this.navigation.tab === 'treeView') this.$refs.treeview.updateAll(this.bookmarks.expandAll)
        this.$Progress.finish()
      }, 30)
    },

    // searchByHashtag: function(searchArr) {
    //   this.$Progress.start()
      
    //   function f(o) {
    //     searchArr = searchArr.map(o => "^" + o + "$")
    //     var regex = new RegExp(searchArr.join("|"), "i")
    //     var isAvailable = false
    //     if (o.tags) {
    //       o.tags.map( (t) => {
    //         isAvailable = isAvailable || regex.test(t)
    //       })
    //       return isAvailable
    //     }
    //     if (o.children) {
    //       return (o.children = o.children.filter(f))
    //     }
    //   }

    //   var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))

    //   if (searchArr.length == 0) {
    //     var res = bookmarksCopy
    //   } else {
    //     var res = bookmarksCopy.filter(f)
    //   }

    //   this.bookmarks.list = res
    //   this.bookmarks.expandAll = true
    //   setTimeout( () => {
    //     this.$refs.treeview.updateAll(this.bookmarks.expandAll)
    //     this.$Progress.finish()
    //   }, 30)
    // },

    searchByHashtagAlt: function(searchArr) {
      this.$Progress.start()
      this.searchTerm = ''

      function filterData(data, reg) {
        var res = data.filter(function(o) {
          if (o.children) {
            o.children = filterData(o.children, reg)
            return o.children.length + 1 - 1
          }
          if (o.tags) {
            return o.tags.some( (e) => {return reg.test(e)})
          }
        })
        return res;
      }

      var bookmarksCopy = JSON.parse(JSON.stringify(this.bookmarks.original))

      if (searchArr.length == 0) {
        var res = bookmarksCopy
      } else {
        searchArr = searchArr.map(o => "^" + o + "$")
        var regex = new RegExp(searchArr.join("|"), "i")
        var res = filterData(bookmarksCopy, regex)
      }

      this.bookmarks.list = res
      this.bookmarks.expandAll = true
      setTimeout( () => {
        if (this.navigation.tab === 'treeView') this.$refs.treeview.updateAll(this.bookmarks.expandAll)
        this.$Progress.finish()
      }, 30)
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

<style lang="styl">
img.favicon
  width: 16px
  height: 16px

.primary-selected
  background-color: #bfd3ff !important

.tag-chip
  display: inline-block
  cursor: pointer
  color: black
  background: #eee
  margin: .5em
  padding: .75em
  border-radius: 2em
  vertical-align: middle
  & > span
    vertical-align: middle

.v-list__tile
  white-space: nowrap
  .bookmark-title, .bookmark-url
    max-width: 450px

</style>

