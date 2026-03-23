jupyter lab \
--port 8888 \
--NotebookApp.token='' \
--NotebookApp.allow_origin='*' \
--NotebookApp.tornado_settings="{'headers':{'Content-Security-Policy': \"frame-ancestors *\"}}"