# CharliesBucket

## Game Specification: Charlie's Bucket

Charlie's Bucket is a browser-based game where players control a bucket to catch falling raindrops. The goal is to fill the bucket by catching as many raindrops as possible.

### Game Features

1. **Bucket Control**
   - A bucket (represented as a trapezoid) follows the mouse cursor position
   - The bucket moves smoothly with mouse movements
   - Full-screen application that covers the entire viewport

2. **Raindrop Mechanics**
   - Raindrops fall continuously from the top of the screen
   - Raindrops have random positions and falling speeds
   - Raindrops are visually distinct from the bucket

3. **Bucket Filling System**
   - When raindrops enter the bucket area, they are "caught"
   - The bucket fills up with water as raindrops are caught
   - Water level is visible through slight transparency in the bucket
   - Visual feedback when raindrops hit the bucket

4. **Visual Design**
   - Simple, clean graphics
   - Full-screen responsive design
   - Smooth animations for bucket movement and raindrop falling
   - Transparency effects to show water level inside the bucket

### Technical Implementation

- **HTML5 Canvas** or **CSS/JavaScript** for rendering
- **Mouse event listeners** for bucket control
- **Animation loop** for continuous raindrop falling
- **Collision detection** between raindrops and bucket
- **Water level visualization** using transparency effects

### Game Flow

1. Player positions the bucket at the bottom of the screen
2. Raindrops begin falling from the top
3. Player moves the bucket to catch raindrops
4. Each caught raindrop increases the water level in the bucket
5. Game continues indefinitely with increasing difficulty (more raindrops, faster speeds)

### Controls

- **Mouse Movement**: Control the position of the bucket
- No additional controls required

### Future Enhancements (Optional)

- Score tracking system
- Sound effects for catching raindrops
- Different types of raindrops (normal, special)
- Power-ups or obstacles
- Particle effects for raindrop impacts
- Multiple bucket sizes or shapes
