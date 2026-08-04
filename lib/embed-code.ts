export function getEmbedCode(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return `<div id="aseduis-encuesta-${slug}">
  <iframe
    src="${baseUrl}/encuestas/${slug}"
    style="width:100%; border:none; min-height:400px;"
    scrolling="no"
    id="iframe-${slug}"
  ></iframe>
</div>
<script>
(function() {
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'aseduis-survey-height' && e.data.slug === '${slug}') {
      var iframe = document.getElementById('iframe-${slug}');
      if (iframe) iframe.style.height = e.data.height + 'px';
    }
  });
})();
</script>`
}