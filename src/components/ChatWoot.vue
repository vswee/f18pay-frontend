<template>
  <div></div>
</template>

<script>
export default {
  name: "ChatWoot",
  props: {
    hideMessageBubble: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    const demoMode = typeof window !== 'undefined'
      && (window.location.search.includes('demo=1') || window.localStorage.getItem('f18_demo_mode') === '1');

    if (demoMode || document.getElementById('chatwoot-sdk')) return;

    window.chatwootSettings = {
      hideMessageBubble: this.hideMessageBubble,
      position: "right",
      locale: "en",
      type: "expanded_bubble",
      launcherTitle: "Get support"
    };

    try {
      const baseUrl = "https://chatwoot.flat18.co.uk";
      const script = document.createElement('script');
      const firstScript = document.getElementsByTagName('script')[0];
      script.id = 'chatwoot-sdk';
      script.src = `${baseUrl}/packs/js/sdk.js`;
      script.defer = true;
      script.async = true;
      firstScript.parentNode.insertBefore(script, firstScript);
      script.onload = () => {
        window.chatwootSDK.run({
          websiteToken: 'ANNVbgEzAvFv7Ai5rLTPBfmw',
          baseUrl
        });
      };
    } catch (e) { console.log("Error setting up chatwoot") }
  },
};
</script>
