/**
 * The social card frame, in one place.
 *
 * Split out from build-og.mjs because both sides need these numbers and only
 * one side can afford the renderer's dependencies: Head.astro emits them as
 * og:image:width/height, and importing them from the build script would pull
 * resvg and fontkit into the site build for two integers.
 *
 * They must not drift. A card that declares one size in its meta tags and
 * renders at another gets letterboxed or cropped by every consumer that
 * trusts the tag — and the tag is trusted precisely because it is usually
 * right.
 */
export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630
