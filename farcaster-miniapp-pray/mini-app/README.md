# Farcaster Mini App: Sheep a Sheep

This is a Farcaster Mini App clone of the popular tile-matching game "Sheep a Sheep".

Features:
- **Relaxing Match-3 Gameplay**: Match 3 identical tiles to clear them.
- **Level System**: Includes a tutorial level (Level 1) and progressively harder levels.
- **Solvable Levels**: Uses a reverse-solver algorithm to ensure every generated level has a solution.
- **3D Visuals**: Custom claymorphism style tiles and forest theme.

Built with [Vite](https://vitejs.dev) and [`@farcaster/create-mini-app`](https://github.com/farcasterxyz/miniapps/tree/main/packages/create-mini-app).

## Deploy

This project is ready to be deployed on Vercel. Push to `master` to trigger a new deployment.

For documentation and guides, visit [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz/docs/getting-started).

## `farcaster.json`

The `/.well-known/farcaster.json` is served from the [public
directory](https://vite.dev/guide/assets) and can be updated by editing
`./public/.well-known/farcaster.json`.

You can also use the `public` directory to serve a static image for `splashBackgroundImageUrl`.

## Frame Embed

Add a the `fc:frame` in `index.html` to make your root app URL sharable in feeds:

```html
  <head>
    <!--- other tags --->
    <meta name="fc:frame" content='{"version":"next","imageUrl":"https://placehold.co/900x600.png?text=Frame%20Image","button":{"title":"Open","action":{"type":"launch_frame","name":"App Name","url":"https://app.com"}}}' /> 
  </head>
```

