# EMI Planner — Google Play assets

These files are ready to upload to the Google Play Console. Screenshots are taken from the real Android app and exported as high-quality JPEGs without transparency.

## Upload map

| Play Console section | Folder / file | Size | Files |
| --- | --- | --- | --- |
| App icon | `store/app-icon-512.png` | 512 × 512 | 1 |
| Feature graphic | `store/feature-graphic-1024x500.png` | 1024 × 500 | 1 |
| Phone screenshots | `phone/` | 1080 × 1920, 9:16 | 7 |
| 7-inch tablet screenshots | `tablet-7/` | 1080 × 1920, 9:16 | 7 |
| 10-inch tablet screenshots | `tablet-10/` | 1920 × 1080, 16:9 | 7 |
| Chromebook screenshots | `chromebook/` | 1920 × 1080, 16:9 | 7 |

Upload the screenshots in their numbered filename order. Do not upload these as Wear OS, Android TV, or Android Automotive screenshots unless the app is actually released for those form factors.

Official requirements checked on 18 August 2026: <https://support.google.com/googleplay/android-developer/answer/9866151?hl=en>

## Suggested listing copy

Short description:

> Calculate EMI, compare loan offers, and understand your full repayment cost.

Suggested screenshot descriptions (for Play Console accessibility text):

1. EMI Planner introduction highlighting payment insights and private on-device storage.
2. EMI calculator with loan amount, interest rate, tenure inputs, and adjustable sliders.
3. Repayment breakdown showing monthly EMI, total interest, total payment, and principal split.
4. Home loan details showing monthly payment, lifetime interest, total payment, rate, and tenure.
5. Amortization timeline showing falling balance and a month-by-month payment schedule.
6. Loan portfolio showing total borrowed, monthly outgo, and saved home and car loans.
7. Loan comparison recommending the lower-cost offer and showing EMI and total-interest trade-offs.

For tablet and Chromebook sets, use the descriptions that match each filename; screenshot 7 shows privacy and theme settings:

> Settings showing theme choices, local storage, and privacy information.

## Generated artwork prompts

The icon and feature graphic were created with OpenAI's built-in image-generation tool. The screenshots themselves were captured from the running app.

### App icon

```text
Use case: logo-brand
Asset type: Google Play store app icon for an Indian EMI and loan planning app
Primary request: create an original, premium app icon that combines a simple sprouting leaf with a subtle Indian rupee symbol, communicating financial growth and manageable loans
Style/medium: clean flat vector-like icon, strong silhouette, modern fintech aesthetic
Composition/framing: one centered mark, large and immediately readable at small sizes, generous safe padding, rounded-square composition but do not draw an outer device frame
Color palette: emerald green #168765, fresh mint #DDF3EB, warm off-white; a very small warm orange #E87932 accent only if useful
Materials/textures: flat solid colors with at most one subtle soft gradient
Constraints: no words, no letters besides the single rupee symbol, no numbers, no bank or third-party logos, no Google Play badge, no watermark, no transparency, no mockup, no 3D, no photographic elements; crisp professional production-ready artwork; keep all important artwork inside the central 80% safe area
```

### Feature graphic

```text
Use case: ads-marketing
Asset type: Google Play feature graphic, final canvas exactly 1024 by 500 pixels, approximately 2.048:1 landscape
Input images: Image 1 is a visual identity reference only; reuse its emerald, mint, orange palette and sprouting-finance concept, but do not simply place the full app icon prominently
Primary request: create a polished feature graphic for an Indian EMI planning app that communicates clarity, control, and steadily reducing debt
Scene/backdrop: rich emerald-to-teal background with subtle mint curved repayment paths, a tasteful decreasing balance visualization, and one small growing leaf motif; clean and uncluttered
Style/medium: premium flat/vector-like fintech campaign artwork, crisp and modern
Composition/framing: landscape, all critical content centered inside the middle 60% safe zone; background decoration only near edges; no phone or device frame
Lighting/mood: trustworthy, optimistic, calm
Color palette: emerald green #168765, deep green, mint #DDF3EB, warm off-white, tiny orange #E87932 accent
Text (verbatim): "EMI Planner" and "Plan loans with confidence"
Typography: large clean bold sans-serif; render both text strings exactly once, centered and highly legible
Constraints: exact words only; no extra text, no rupee amounts, no rankings, no awards, no pricing claims, no call to action, no third-party logos, no Google Play badge, no device imagery, no watermark, no transparency; avoid pure white or black outer background; preserve generous safe margins for Play Store cropping
```
