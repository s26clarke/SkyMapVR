import subprocess
import sys
import time


def run_server(script_name):
    return subprocess.Popen([sys.executable, script_name])


def main():
    try:
        print("Starting HTTPS server...")
        https_process = run_server(r"https_server/https_server.py")
        time.sleep(2)  # Give the server time to start

        print("Starting Flask server...")
        flask_process = run_server(r"flask_server/flask_server.py")

        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down servers...")
        https_process.terminate()
        flask_process.terminate()
    finally:
        print("Servers stopped.")


if __name__ == "__main__":
    main()