import os
import signal
import subprocess
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Store running processes globally so we can stop them cleanly
processes = []

def run_with_restart(cmd, name):
    import time
    while True:
        print(f"[{name}] Starting: {' '.join(cmd)}")
        process = subprocess.Popen(cmd)
        processes.append(process)
        ret_code = process.wait()
        processes.remove(process)
        print(f"[{name}] Exited with code {ret_code}. Restarting in 60 seconds...")
        time.sleep(60)

def start_worker():
    # for prod
    # run_with_restart(["celery", "-A", "sameboat", "worker", "--loglevel=info"], "Worker")
    # for locally
    run_with_restart(["celery", "-A", "sameboat", "worker","--pool=solo", "--loglevel=info"], "Worker")


def start_beat():
    run_with_restart(["celery", "-A", "sameboat", "beat", "--loglevel=info"], "Beat")

def start_server():
    port = int(os.environ.get("PORT", 8000))
    httpd = HTTPServer(("0.0.0.0", port), SimpleHTTPRequestHandler)
    print(f"[Server] Running on port {port}")
    httpd.serve_forever()

def shutdown_handler(signum, frame):
    print(f"[Main] Received signal {signum}. Shutting down...")
    for p in processes:
        try:
            p.terminate()
        except Exception as e:
            print(f"[Main] Error terminating process: {e}")
    os._exit(0)

if __name__ == "__main__":
    # Register graceful shutdown
    signal.signal(signal.SIGTERM, shutdown_handler)
    signal.signal(signal.SIGINT, shutdown_handler)

    # Run worker + beat in background threads
    threading.Thread(target=start_worker, daemon=True).start()
    threading.Thread(target=start_beat, daemon=True).start()

    # Run a dummy server (keeps container alive)
    start_server()
