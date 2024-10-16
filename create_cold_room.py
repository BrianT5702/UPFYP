import bpy
import sys
import os

def parse_arguments():
    args = sys.argv
    try:
        width = float(args[args.index("--width") + 1])
        height = float(args[args.index("--height") + 1])
        depth = float(args[args.index("--depth") + 1])
        unit = args[args.index("--unit") + 1]
        exterior_filename = args[args.index("--exterior_filename") + 1]
        interior_filename = args[args.index("--interior_filename") + 1]

        print(f"Received dimensions: width={width}, height={height}, depth={depth}, unit={unit}")
        return width, height, depth, unit, exterior_filename, interior_filename
    except (ValueError, IndexError) as e:
        print(f"Error: Missing or incorrect command line arguments. {str(e)}")
        sys.exit(1)

def scale_dimensions(width, height, depth):
    max_dim = max(width, height, depth)
    scale_factor = 10 / max_dim
    
    scaled_width = width * scale_factor
    scaled_height = height * scale_factor
    scaled_depth = depth * scale_factor
    
    return scaled_width, scaled_height, scaled_depth, scale_factor

def create_room(scaled_width, scaled_height, scaled_depth, is_interior=False):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Create the room (a cube)
    bpy.ops.mesh.primitive_cube_add(size=1)
    outer_room = bpy.context.object
    outer_room.scale = (scaled_width / 2, scaled_depth / 2, scaled_height / 2)  # depth = z, height = y
    outer_room.location = (0, 0, scaled_height / 2)

    # If interior view, remove the roof by selecting the top face
    if is_interior:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='DESELECT')

        # Switch to face selection mode and select the top face
        bpy.ops.mesh.select_mode(type='FACE')
        bpy.ops.object.mode_set(mode='EDIT')

        # Remove the top face (roof) using the known index for the top face
        bpy.ops.mesh.select_non_manifold()  # Select the non-manifold edges (roof)
        bpy.ops.mesh.delete(type='FACE')  # Delete the top face (roof)
        
        bpy.ops.object.mode_set(mode='OBJECT')

    # Apply transformations
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)
    
    return outer_room

def main():
    width, height, depth, unit, exterior_filename, interior_filename = parse_arguments()

    # Convert units to meters if needed
    if unit == "mm":
        width, height, depth = width / 1000, height / 1000, depth / 1000
    elif unit == "cm":
        width, height, depth = width / 100, height / 100, depth / 100
    elif unit == "inch":
        width, height, depth = width * 0.0254, height * 0.0254, depth * 0.0254

    # Scale dimensions for Blender
    scaled_width, scaled_height, scaled_depth, scale_factor = scale_dimensions(width, height, depth)

    # Create exterior model
    create_room(scaled_width, scaled_height, scaled_depth, is_interior=False)
    try:
        bpy.ops.export_scene.gltf(filepath=exterior_filename, export_format='GLB')
        print(f"Exterior model exported to {exterior_filename}")
    except Exception as e:
        print(f"Failed to export exterior model: {e}")
        sys.exit(1)

    # Create interior model (remove the roof)
    create_room(scaled_width, scaled_height, scaled_depth, is_interior=True)
    try:
        bpy.ops.export_scene.gltf(filepath=interior_filename, export_format='GLB')
        print(f"Interior model exported to {interior_filename}")
    except Exception as e:
        print(f"Failed to export interior model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
