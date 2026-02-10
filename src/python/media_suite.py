import sys
import os
import json
from engine_base import PythonEngine

# Optional: Import Media libraries
try:
    from rembg import remove
    from PIL import Image
    import io
    HAS_MEDIA_LIBS = True
except ImportError:
    HAS_MEDIA_LIBS = False

class MediaSuite(PythonEngine):
    """
    Handles Image and Video processing (Background removal, Filters, etc).
    """

    def remove_bg(self, data):
        """Remove image background using rembg."""
        if not HAS_MEDIA_LIBS:
            return "Error: Media libraries (rembg, PIL) not installed. Run 'pip install rembg pillow'."

        input_path = data.get('input_path')
        output_path = data.get('output_path')

        if not input_path or not os.path.exists(input_path):
            return f"Error: Input file found at {input_path}"

        try:
            with open(input_path, 'rb') as i:
                input_image = i.read()
                output_image = remove(input_image)
                
                with open(output_path, 'wb') as o:
                    o.write(output_image)
            
            return {"output": output_path}
        except Exception as e:
            return f"Error during processing: {str(e)}"

    def apply_filter(self, data):
        """Placeholder for Pilllow filters."""
        # Implementation for later
        return "Not implemented yet."

if __name__ == "__main__":
    engine = MediaSuite()
    engine.run()
