# IITH Pulse Portal Login Helper

A Chrome extension to log in to the IITH Pulse Portal.

## Setup

1. Google Cloud: create a project, enable the Gmail API, set up the consent screen (External, Testing, your IITH email as a test user), and create an OAuth client of type **Chrome Extension** with this extension's ID.

2. Put the client ID in `manifest.json` → `oauth2.client_id`, and your email in `content.js` → `EMAIL`.

3. In a Chrome profile signed in with your IITH account: `chrome://extensions` → Developer mode → Load unpacked → this folder.

4. Open `/login` and approve the Google consent popup once.
