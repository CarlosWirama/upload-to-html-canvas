# upload-to-html-canvas

## Feature
1. Upload image(s) and view them in HTML Canvas.
2. Select an area in the image to create tags. Tags can have a name, can be moved or deleted.
3. Every image will have their own tags.
4. Images and tags will be stored in browser's local storage.
5. Responsive with 1 single layout for any viewport
6. Using pure HTML5, Javascript (ES6), CSS, without any additional library.


## Running
Just open [index.html](index.html) in your browser


## Limitation
1. The code uses Javascript ES6 without any bundler. Might not work in older version.
2. No unit test yet. Not going to build any bundler for this.


## Known bugs
1. Drag and drop feature in canvas might become a bit off when changing viewport drastically. Other display works fine.
2. Unable to upload 2 file with the same name in a row, due to HTML file input's behavior. (Deprioritized)
3. When user moves the mouse pointer away from canvas, highlighted tag will still be highlighted. Expected to return to normal. (Deprioritized)
4. Following the bug above, when you highlight a tag and then switch the image, another tag in that image could be highlighted. (Deprioritized)


## Possible future enhancement
1. Mini thumbnail
2. Revamp layout design and UX
3. Add unit tests
