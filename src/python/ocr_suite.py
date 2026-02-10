import sys
import os
import json
from engine_base import PythonEngine

try:
    import easyocr
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

class OCRSuite(PythonEngine):
    def __init__(self):
        self.reader = None

    def _get_reader(self):
        if not self.reader and HAS_OCR:
            # Initialize once if needed
            self.reader = easyocr.Reader(['en', 'kn'], gpu=False)
        return self.reader

    def extract_text(self, data):
        if not HAS_OCR:
            return "Error: EasyOCR not installed."
            
        image_path = data.get('image_path')
        if not image_path or not os.path.exists(image_path):
            return "Error: Image not found."

        try:
            reader = self._get_reader()
            results = reader.readtext(image_path, detail=0)
            return "\n".join(results)
        except Exception as e:
            return f"Error: {str(e)}"

if __name__ == "__main__":
    engine = OCRSuite()
    engine.run()
