# upload-to-html-canvas

## Feature
1. Upload image(s) and view them in HTML Canvas.
2. Select an area in the image to create tags. Tags can have a name, can be added / deleted.
3. Every image will have their own tags.
4. Using pure HTML5, Javascript (ES6), CSS, without any additional library.


## Running
Just open [index.html](index.html)


## Limitation
1. The code uses Javascript ES6 without any bundler. Might not work in older version.
2. Responsive with 1 single layout for any viewport. Drag and drop feature in canvas might become a bit off when changing viewport drastically. This is a known issue and not going to fix anytime soon. Other display works fine.
3. Unable to upload 2 file with the same name in a row, due to HTML file input's behavior. Might be fixed later.
4. No storage system for now. Might implement browser side storage using localStorage in the near future.
5. No unit test yet. Not going to build any bundler for this.


## Possible future enhancement
1. Store images and tags in browser's localStorage.
2. Drag tags (rectangles) to a different position.
3. Mini thumbnail
4. Revamp layout design and UX
5. Add unit tests