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

def create_interior_room(scaled_width, scaled_height, scaled_depth):
    """Create a room with proper walls and ceiling removed for interior visualization."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Create the base of the room (floor)
    bpy.ops.mesh.primitive_plane_add(size=1)
    floor = bpy.context.object
    floor.scale = (scaled_width / 2, scaled_depth / 2, 1)
    floor.location = (0, 0, 0)

    # Create back wall
    bpy.ops.mesh.primitive_plane_add(size=1)
    back_wall = bpy.context.object
    back_wall.scale = (scaled_width / 2, scaled_height / 2, 1)
    back_wall.location = (0, -scaled_depth / 2, scaled_height / 2)
    back_wall.rotation_euler[0] = 1.5708  # 90 degrees in radians

    # Create left wall
    bpy.ops.mesh.primitive_plane_add(size=1)
    left_wall = bpy.context.object
    left_wall.scale = (scaled_depth / 2, scaled_height / 2, 1)
    left_wall.location = (-scaled_width / 2, 0, scaled_height / 2)
    left_wall.rotation_euler[1] = 1.5708  # 90 degrees in radians

    # Create right wall
    bpy.ops.mesh.primitive_plane_add(size=1)
    right_wall = bpy.context.object
    right_wall.scale = (scaled_depth / 2, scaled_height / 2, 1)
    right_wall.location = (scaled_width / 2, 0, scaled_height / 2)
    right_wall.rotation_euler[1] = 1.5708  # 90 degrees in radians

    # Create ceiling (optional)
    bpy.ops.mesh.primitive_plane_add(size=1)
    ceiling = bpy.context.object
    ceiling.scale = (scaled_width / 2, scaled_depth / 2, 1)
    ceiling.location = (0, 0, scaled_height)

    # Join all objects into one room
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = floor
    bpy.ops.object.join()

    # Apply transformations
    bpy.ops.object.transform_apply(location=True, scale=True, rotation=True)

    return bpy.context.object

def create_exterior_room(scaled_width, scaled_height, scaled_depth):
    """Create the exterior view of the room."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Create the room (a cube with roof)
    bpy.ops.mesh.primitive_cube_add(size=1)
    outer_room = bpy.context.object
    outer_room.scale = (scaled_width / 2, scaled_depth / 2, scaled_height / 2)
    outer_room.location = (0, 0, scaled_height / 2)

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

    # Create and export interior model
    interior_room = create_interior_room(scaled_width, scaled_height, scaled_depth)
    try:
        bpy.ops.export_scene.gltf(filepath=interior_filename, export_format='GLB')
        print(f"Interior model exported to {interior_filename}")
    except Exception as e:
        print(f"Failed to export interior model: {e}")
        sys.exit(1)

    # Clear the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Create and export exterior model
    exterior_room = create_exterior_room(scaled_width, scaled_height, scaled_depth)
    try:
        bpy.ops.export_scene.gltf(filepath=exterior_filename, export_format='GLB')
        print(f"Exterior model exported to {exterior_filename}")
    except Exception as e:
        print(f"Failed to export exterior model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()