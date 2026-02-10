import easyocr
import sys
import os
import json

# Set logging to error only to avoid polluting stdout
import logging
logging.getLogger('easyocr').setLevel(logging.ERROR)

def extract_text(image_path):
    try:
        # Initialize reader (English + Kannada)
        # GPU=False because we are running on CPU in proot usually
        reader = easyocr.Reader(['en', 'kn'], gpu=False)
        
        # Perform OCR
        results = reader.readtext(image_path, detail=0)
        
        # Combine results
        text = "\n".join(results)
        
        # Output clean text
        print(text)
        
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ocr_engine.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}", file=sys.stderr)
        sys.exit(1)
        
    extract_text(image_path)
