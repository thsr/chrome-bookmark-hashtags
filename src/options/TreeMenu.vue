<template>
    <ul class="node">

        <li class="label" @click="toggleChildren" :class="hasChildren">

            <span v-if="node.children">&nbsp;<i class="fa" :class="faFolderOpenClose" aria-hidden="true"></i>&nbsp; </span>
            <span v-else><img class="favicon" :src="favicon"/> </span>
            <span class="title">{{ node.title }}</span>
            <span v-if="node.url"><br><span class="url"><a :href="node.url" target="_blank">{{ node.url }}</a></span></span>

        </li>
        <transition-group name="fade-slide-y" mode="in-out" appear>
        <tree-menu 
            :key="node.id"
            v-if="showChildren || expandAll"
            v-for="child in node.children" 
            :node="child"
            :depth="depth + 1"
            :expandAll="expandAll"
            ></tree-menu></transition-group>

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
        favicon() {
            var regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/g
            var groups = regex.exec(this.node.url)
            if (groups) {
                return "chrome://favicon/https://" + groups[3]
            } else {
                return "chrome://favicon"
            }

        },

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


.fade-slide-y-enter-active, .fade-slide-y-leave-active{
    transition: all .2s;
}

.fade-slide-y-enter, .fade-slide-y-leave-to{
    opacity: 0;
    transform: translateY(-10px);
}


.container {
    width: 300px;
    margin: 0 auto;
}

ul.node {
    list-style-type: none;
}

.has-children {
    cursor: pointer;
    background: #eee;
}

.label {
    vertical-align: middle;

    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    margin-bottom: -1px;
    padding: 5px;
    
    .title, .url {
        display: inline-block;
        vertical-align: middle;
        max-width: 450px;
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