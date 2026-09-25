# Chrome Web Store submission guide

This guide takes you from the code in this repository to a published Chrome Web Store listing. The text for each dashboard field is in [listing.md](listing.md). The images are in [assets/](assets/).

## Files in this folder

| File | Use |
|---|---|
| `GUIDE.md` | This guide |
| `listing.md` | Text to copy into the dashboard |
| `assets/store-icon-128.png` | Store icon: 96 px of art with 16 px of transparent padding |
| `assets/screenshot-*.png` | Five screenshots, 1280 × 800 |
| `assets/promo-small-440x280.png` | Small promo tile (required) |
| `assets/promo-marquee-1400x560.png` | Marquee promo tile (optional) |
| `generate-assets.js` | Makes all the images again from the real extension |
| `pages/dashboard.html` | The demo page in the screenshots. All its data is fictional. |

## 1. Set up the developer account

Do these steps one time:

1. Turn on 2-Step Verification for the Google account that will publish Veil.
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) and sign in.
3. Accept the developer agreement.
4. Pay the one-time registration fee. At the time of writing, the fee was US$5.
5. Enter a publisher name, for example your own name.
6. Enter a contact email address. You cannot change this address later, so use an address that you read often.
7. Verify the contact email address.
8. Answer the trader question. If you publish Veil for free and not as part of a business, you are usually a non-trader.

## 2. Prepare the release

The store accepts only a version number that is higher than all earlier uploads. Version 1.0.0 on GitHub does not have the fixes in the `[Unreleased]` section of the changelog, so publish 1.0.1 or higher.

1. Merge the open pull requests into `main`.
2. Create a branch for the release.
3. Set the same version in `extension/manifest.json` and `package.json`, for example `1.0.1`.
4. In `CHANGELOG.md`, rename `[Unreleased]` to the new version and date, and add a new empty `[Unreleased]` section.
5. Run the tests:

   ```bash
   npm test
   ```

6. Commit, open a pull request, and merge it after CI passes.
7. On `main`, build the zip:

   ```bash
   npm run package
   ```

   The script stops in these conditions: a description longer than 132 characters, different versions in the two files, or uncommitted changes. The script writes the zip to `dist/veil-<version>.zip`. The zip has `manifest.json` at its root, as the store requires.

8. Test the zip before you upload it:
   1. Unzip it to a new folder.
   2. Open `chrome://extensions`, and remove any other copy of Veil.
   3. Click **Load unpacked** and select the new folder.
   4. Make sure that the popup opens, that the picker works, and that sensitive data hiding works on a real site.

9. Create the Git tag and the GitHub release for the new version.

## 3. Upload the extension

1. In the dashboard, click **New item**.
2. Select `dist/veil-<version>.zip`.
3. After the upload, the dashboard opens the new item.

The dashboard takes the name, the summary and the version from `manifest.json`. To change them later, you must upload a new version.

## 4. Fill in the Store listing tab

1. Paste the description from [listing.md](listing.md#description).
2. Select the category and the language from [listing.md](listing.md#other-fields).
3. Upload `assets/store-icon-128.png` as the store icon.
4. Upload the five screenshots in order, from `screenshot-1-mask.png` to `screenshot-5-rules.png`.
5. Upload `assets/promo-small-440x280.png` as the small promo tile.
6. Upload `assets/promo-marquee-1400x560.png` as the marquee promo tile.
7. Enter the homepage URL and the support URL.
8. Leave the video field empty, unless you record a demo video on YouTube.
9. Click **Save draft**.

## 5. Fill in the Privacy practices tab

Copy each value from [listing.md](listing.md#privacy-practices-tab):

1. Paste the single purpose.
2. Paste the justification for each permission. The dashboard shows a field for each permission in `manifest.json`.
3. Select "No" for remote code.
4. Under data usage, select "Website content" only, and select the three certifications.
5. Paste the privacy policy URL.
6. Click **Save draft**.

The privacy policy URL points to the site page at `https://veil-ce.jnahian.me/privacy/`, which the site builds from `PRIVACY.md`. The page updates when the site deploys from `main`. Before you submit, open the URL in a browser, and make sure that it shows the current policy.

## 6. Fill in the Distribution tab

1. Select **Free of charge**.
2. Select **Public** visibility. To test the listing with a few people first, select **Unlisted**. Only people with the link can then find it.
3. Select all regions.
4. Click **Save draft**.

## 7. Submit for review

1. Click **Submit for review**.
2. Select whether to publish automatically after approval. If you want to choose the release time, clear this option. You then have 30 days to publish.
3. Wait for the review email.

Veil asks for access to all sites, so the store gives it an in-depth review. This review can take longer than for extensions with fewer permissions. The clear justifications in step 5 help the reviewer.

If Google rejects the item, the email gives the policy and the reason. Fix the problem, and submit again. For a code change, first upload a new version.

## 8. After publishing

1. Copy the listing URL from the dashboard.
2. Add the URL to the install section of `README.md`, and to the repository's About section on GitHub.

## Publish an update

1. Do all the steps in section 2 with a higher version number.
2. In the dashboard, open Veil, go to the **Package** tab, and click **Upload new package**.
3. If the permissions changed, update the justifications in the Privacy practices tab. New permissions can also disable the extension for current users until they accept the new permissions.
4. If the user interface changed, update the images. Section 9 tells you how.
5. Click **Submit for review**.

## 9. Make the images again

The screenshots show the real extension in Chromium. When the user interface changes, make them again:

```bash
npm run store:assets
```

The script writes all images to `assets/`. Look at each image before you upload it. The demo page is `pages/dashboard.html`, and the script sets the rules and the popup content at the top of `generate-assets.js`.

The store rules for the images are:

- Screenshots: 1280 × 800 or 640 × 400, from 1 to 5 images, with square corners and no padding.
- Small promo tile: 440 × 280. Without it, the store shows the listing less prominently.
- Marquee promo tile: 1400 × 560, optional.
- Promo tiles: little or no text, and art that fills the whole tile.
- Store icon: 128 × 128 PNG, with 96 × 96 of art and 16 px of transparent padding.

## Common reasons for rejection

- The description or screenshots show a feature that the extension does not have.
- A permission has no clear justification, or the extension does not use it. Veil uses all its permissions.
- The privacy policy URL does not open, or the policy does not match the data disclosure.
- The listing uses the name or logo of another company. The demo page uses the fictional name Lumen Books and `.example` addresses for this reason.
