# requests-modifier
Chrome extension to redirect requests to another url

# Why do I use it?
This extension is a good learning material - you will learn
- How to create chrome extensions
- Basics of typescript
- How ad blockers work

## Want to try out ad block without risking private info?
- Install this extension from google chrome or download from releases
- Download the file `adBlockrules.arjson` from export directory of this repository
- Open the extension page and click Import
- Import the file you downloaded
- You can enjoy ad free stuff on the internet!

# Init
```
npm install
```

# Development
```
npm run watch
```

- Add the `./dist` directory to chrome
    - Head to `chrome://extensions`
    - Load unpacked
    - Open options by clicking Extension's icon in toolbar

# Production Build
```
npm run build
```

- `./dist` directory has the production version of extension
