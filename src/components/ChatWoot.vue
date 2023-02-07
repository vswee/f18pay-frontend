<template>
  <div></div>
</template>

<script>
window.chatwootSettings = {
  hideMessageBubble: false,
  position: "right",
  locale: "en",
  type: "expanded_bubble",
  launcherTitle:"Get support"
};

      (function(d,t) {
        var BASE_URL="https://chatwoot.flat18.co.uk";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.defer = true;
        g.async = true;
        s.parentNode.insertBefore(g,s);
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: 'ANNVbgEzAvFv7Ai5rLTPBfmw',
            baseUrl: BASE_URL
          })
        }
      })(document,"script");
    

export default {
  name: "ChatWoot",
};
</script>