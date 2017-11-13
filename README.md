# file-uploader

A mulitple files uploader, support resuming from break point.

* server: nodejs
* client: html, rxjs

## run

1. Start server. By default, this will start a server at `http://localhost:9999`
    ```bash
    node server.js
    ```

1. Open your browser and visit the server. The file selection support drag & drop.

1. The uploaded file will be stored in `./upload` by default.