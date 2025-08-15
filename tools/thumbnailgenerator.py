import os
from PIL import Image

# Change this to your folder path
folder_path = "."

# Thumbnail size (quarter of 900x600)
thumb_size = (225, 150)

for filename in os.listdir(folder_path):
    if filename.lower().endswith(".webp"):
        file_path = os.path.join(folder_path, filename)
        
        try:
            with Image.open(file_path) as img:
                img_thumb = img.resize(thumb_size, Image.LANCZOS)

                name, ext = os.path.splitext(filename)
                thumb_filename = f"{name}_thumb.webp"
                thumb_path = os.path.join(folder_path, thumb_filename)

                img_thumb.save(thumb_path, "WEBP")
                print(f"Thumbnail created: {thumb_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Done!")
