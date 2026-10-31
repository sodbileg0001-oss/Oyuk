# Secret-garden visual assets

The author supplied `../e35d5d0658b834331e78dca7da986fc1.jpg` as an aesthetic
reference. Its dark pond, ivory lace, antique frames, muted floral painting,
and burgundy reply section guide the website. No names, wedding details, or
text from the reference are copied into the invitation.

Both backgrounds below were generated with the built-in Imagegen tool,
inspected, and copied into the project. The PNG originals remain in the
generator's output directory. The app references only the project copies.

## Pond background

Saved path: `public/theme/garden-pond.png`

Final prompt:

> Use case: photorealistic-natural. Asset type: a wide, full-bleed background photograph for an intimate vintage secret-garden invitation website. Create a beautiful realistic secluded English garden pond beneath cascading old willow branches at dusk. Deep near-black forest green foliage and dark still water with quiet reflections, a single graceful white swan swimming on the right half. Timeless old-world romantic atmosphere, subtle film grain, natural muted green and warm ivory palette, painterly photographic light, low exposure but detailed foliage. Wide landscape composition, lots of calm dark negative space in the central and left areas for ivory website typography, the swan unobscured and not too close to any edge. No people, no buildings, no lettering, no typography, no logos, no borders, no layout, no watermarks. This must be the standalone pond photograph, not an image of a website or invitation. Landscape 16:9 composition.

## Botanical background

Saved path: `public/theme/garden-florals.png`

Final prompt:

> Use case: historical-scene. Asset type: decorative full-bleed background image for the lower section of a vintage secret-garden invitation website. A richly detailed Dutch Golden Age oil-painting still life of antique ivory peonies, faded blush roses, a few muted rust-red blooms and small slate-blue flowers with dark olive leaves, emerging from a deep almost-black forest-green background. Dense botanical arrangement concentrated along the bottom and lower corners, upper half mostly quiet dark negative space for ivory website text. Old-world romantic and slightly moody, warm ivory and subdued burgundy, aged canvas texture, soft chiaroscuro lighting, exquisite organic petals, tasteful and calm, no neon or modern graphic style. Wide horizontal landscape format. No text, no letters, no monograms, no people, no vase, no frames, no website layout, no watermark. A standalone antique floral painting.

## Code-native decoration

`public/theme/lace.svg` is a repeating ivory lace ornament drawn in SVG.
`src/components/GardenSeal.tsx` draws the ornamental heart seal in SVG.
Gold picture frames, ivory folios, and the burgundy reply layout use CSS.
