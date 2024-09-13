// sw.js
var LOADING_HTML = `
<div id='loading'>
<style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <script>
    window.onload=()=>{
     
      }
    </script>
    <div class="loader"></div>
    </div>
`;

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' &&  event.request.url.indexOf('list.html')>-1) {
      console.log('Handling fetch event for', event.request.url);
        event.respondWith(streamingResponse(event.request));
    }
});

async function streamingResponse(request) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            
            // Send loading HTML immediately
            controller.enqueue(encoder.encode(LOADING_HTML));
            
            // Fetch the actual content
            fetch(request)
                .then(response => response.text())
                .then(content => {
                    // Wrap the content in a script tag to replace the loading indicator
                    // const scriptWrappedContent = `<script>replaceContent(\`${content.replace(/`/g, '\\`')}\`);</script>`;
                    
                    setTimeout(()=>{
                      controller.enqueue(encoder.encode('<script>document.getElementById("loading").innerHTML = "";</script>'));
                      controller.enqueue(encoder.encode(content));
                    controller.close();
                    }, 4000);
                    
                })
                .catch(error => {
                    console.error('Fetching failed:', error);
                    controller.enqueue(encoder.encode('<script>replaceContent("An error occurred while loading the content.");</script>'));
                    controller.close();
                });
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}