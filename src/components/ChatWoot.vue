<template>
  <div></div>
</template>

<script>
const demoMode = typeof window !== 'undefined'
  && (window.location.search.includes('demo=1') || window.localStorage.getItem('f18_demo_mode') === '1');

if (!demoMode) {
  window.chatwootSettings = {
    hideMessageBubble: false,
    position: "right",
    locale: "en",
    type: "expanded_bubble",
    launcherTitle: "Get support"
  };

  (function (d, t) {
    try {
      var BASE_URL = "https://chatwoot.flat18.co.uk";
      var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g, s);
      g.onload = function () {
        window.chatwootSDK.run({
          websiteToken: 'ANNVbgEzAvFv7Ai5rLTPBfmw',
          baseUrl: BASE_URL
        })
      }
    } catch (e) { console.log("Error setting up chatwoot") }
  })(document, "script");
}


export default {
  name: "ChatWoot",
};
</script>
