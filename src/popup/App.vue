<template>
  <div>
    <button @click="goToOptionsAsPage">......<br>Options<br>......</button>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    goToOptions: function (event) {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    },
    goToTest: function (event) {
      window.open(chrome.runtime.getURL('pages/pages.html'))
    },
    goToOptionsAsPage: function (event) {
      window.open(chrome.runtime.getURL('options/options.html'))
    },
  }
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
