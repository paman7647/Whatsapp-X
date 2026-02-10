import sys
import json
import os

class PythonEngine:
    """
    Base class for Python AI/Media processing.
    Handles JSON communication with the Node.js bridge.
    """
    def __init__(self):
        pass

    def run(self):
        """Read one request from stdin, process it, and output JSON to stdout."""
        try:
            line = sys.stdin.readline()
            if not line:
                return

            request = json.loads(line.strip())
            action = request.get('action')
            
            if not action:
                self.send_error("No action specified")
                return

            # Dynamically call the method matching the action name
            method = getattr(self, action, None)
            if callable(method):
                result = method(request)
                self.send_success(result)
            else:
                self.send_error(f"Action '{action}' not implemented")

        except Exception as e:
            self.send_error(str(e))

    def send_success(self, data):
        print(json.dumps({"status": "success", "data": data}))

    def send_error(self, message):
        print(json.dumps({"status": "error", "message": message}))

if __name__ == "__main__":
    # This base class isn't meant to be run directly
    pass
