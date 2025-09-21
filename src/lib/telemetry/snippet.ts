export function generateTelemetrySnippet(options: { ingestUrl: string, teamId?: string, copyId?: string, versionId?: string }) {
  const { ingestUrl, teamId, copyId, versionId } = options
  return `
<script>
  (function(){
    const endpoint = '${ingestUrl.replace(/'/g, "\\'")}'
    const payload = {
      type: 'view',
      teamId: ${teamId ? `'${teamId}'` : 'null'},
      copyId: ${copyId ? `'${copyId}'` : 'null'},
      versionId: ${versionId ? `'${versionId}'` : 'null'},
      sessionId: (localStorage.getItem('vs_sid') || (localStorage.setItem('vs_sid', crypto.randomUUID()), localStorage.getItem('vs_sid'))),
      occurredAt: new Date().toISOString(),
      properties: { url: location.href, referrer: document.referrer }
    }
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(()=>{})
  })();
</script>`
}


