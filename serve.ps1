# PowerShell Static File Web Server for HandMade Crochet
# Serves local HTML, CSS, and JS files with proper MIME types on port 8080

$port = 8080
$root = "c:\Users\Tech Shop\Desktop\soha work"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "HandMade Crochet Server successfully running at http://127.0.0.1:$port/"
Write-Host "Press Ctrl+C to terminate."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $path = $req.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $cleanPath = $path.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $cleanPath = $cleanPath.TrimStart([System.IO.Path]::DirectorySeparatorChar)
        $filePath = Join-Path $root $cleanPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            if ($filePath.EndsWith(".html")) {
                $res.ContentType = "text/html; charset=utf-8"
            } elseif ($filePath.EndsWith(".css")) {
                $res.ContentType = "text/css; charset=utf-8"
            } elseif ($filePath.EndsWith(".js")) {
                $res.ContentType = "application/javascript; charset=utf-8"
            } elseif ($filePath.EndsWith(".svg")) {
                $res.ContentType = "image/svg+xml; charset=utf-8"
            } else {
                $res.ContentType = "application/octet-stream"
            }
            
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $path")
            $res.ContentLength64 = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
        }
        $res.Close()
    }
} catch {
    Write-Host "Stopping server: $_"
} finally {
    $listener.Stop()
}
