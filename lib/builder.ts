/**
 * Build a deep link URL to deploy an iApp manifest in Builder.
 * For now, generates a data: URL with an HTML page that displays the manifest
 * and includes a stub POST form.
 */
export function getDeployUrl(manifest: unknown): string {
  const json = JSON.stringify(manifest, null, 2);

  function escapeHtml(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Builder Deploy Stub</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; padding: 16px; }
    pre { background: #0b0b0c; color: #eaeaea; padding: 12px; border-radius: 8px; overflow: auto; }
    .row { margin: 16px 0; }
    button { background: #6e5df6; color: white; border: 0; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
    button:hover { opacity: .9; }
    .muted { color: #9aa0a6; font-size: 12px; }
  </style>
  <script>
    function postStub(e){
      e.preventDefault();
      alert('TODO: POST to Builder endpoint when available');
    }
    function copyJson(){
      navigator.clipboard.writeText(document.getElementById('json').textContent);
    }
  </script>
  </head>
  <body>
    <h1>Builder Deploy Stub</h1>
    <div class="row muted">This page was opened via a data: URL. Replace the form action when the Builder endpoint is ready.</div>
    <div class="row">
      <pre id="json">${escapeHtml(json)}</pre>
    </div>
    <div class="row">
      <form method="post" action="#" onsubmit="postStub(event)">
        <input type="hidden" name="manifest" value='${escapeHtml(json)}' />
        <button type="submit">POST to Builder (stub)</button>
        <button type="button" style="margin-left:8px;background:#2d2e33" onclick="copyJson()">Copy JSON</button>
      </form>
    </div>
  </body>
  </html>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

