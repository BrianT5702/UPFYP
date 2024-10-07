import bpy
import sys

# Get the dimensions from command line arguments
args = sys.argv
width = float(args[args.index("--width") + 1])   # X-axis
height = float(args[args.index("--height") + 1])  # Y-axis
depth = float(args[args.index("--depth") + 1])    # Z-axis
unit = args[args.index("--unit") + 1]  # Get the unit of measurement

# Convert dimensions to centimeters
if unit == "cm":
    pass  # Already in cm
elif unit == "mm":
    height /= 10
    depth /= 10
    width /= 10
elif unit == "in":
    height *= 2.54
    depth *= 2.54
    width *= 2.54

# Log the dimensions received
print(f"Creating model with dimensions: Height={height}, Depth={depth}, Width={width}")

# Function to create the outer room
def create_outer_room(depth, width, height):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.ops.object.select_by_type(type='MESH')
    bpy.ops.object.delete()

    # Create a new cube for the outer room
    bpy.ops.mesh.primitive_cube_add(size=1)
    outer_room = bpy.context.object
    outer_room.scale = (width / 1000, depth / 1000, height / 1000)
    outer_room.location = (0, height / 2 / 1000, depth / 2 / 1000) 

    # Define the export path for the model
    export_path = "C:/Users/brian/OneDrive/Desktop/UPFYP/Start/cold_room_project/models/cold_room_model.glb"
    bpy.ops.export_scene.gltf(filepath=export_path)
    print(f"Model exported to {export_path}")

create_outer_room(depth, width, height)
