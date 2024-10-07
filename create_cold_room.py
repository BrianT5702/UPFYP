import bpy
import sys

# Get the dimensions from command line arguments
args = sys.argv
height = float(args[args.index("--height") + 1])
length = float(args[args.index("--length") + 1])
width = float(args[args.index("--width") + 1])
unit = args[args.index("--unit") + 1]  # Get the unit of measurement

# Convert dimensions to centimeters
if unit == "cm":
    pass  # Already in cm
elif unit == "mm":
    height /= 10
    length /= 10
    width /= 10
elif unit == "in":
    height *= 2.54
    length *= 2.54
    width *= 2.54

# Log the dimensions received
print(f"Creating model with dimensions: Height={height}, Length={length}, Width={width}")

# Function to create the outer room
def create_outer_room(length, width, height):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_by_type(type='MESH')
    bpy.ops.object.delete()

    bpy.ops.mesh.primitive_cube_add(size=1)
    outer_room = bpy.context.object
    outer_room.scale = (length / 2, width / 2, height / 2)
    outer_room.location = (0, 0, height / 2)

    export_path = "C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models/cold_room_model.glb"
    bpy.ops.export_scene.gltf(filepath=export_path)
    print(f"Model exported to {export_path}")

create_outer_room(length, width, height)
