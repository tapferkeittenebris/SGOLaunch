# SGO Launch

Turnkey SGO setup services for public school communities, deployed to Cloudflare Workers with static assets.

## Development and verification

- `npm install`
- `npm run check`
- `npm run dev`
- `npm run build` validates the deployment bundle without publishing.

## Cloudflare deployment

Connect this repository to a Cloudflare Worker named `sgolaunch`. Use `npm run check` as the build command and `npx wrangler deploy` as the deploy command. The Wrangler configuration declares static assets, the contact email binding, and a per-IP rate limiter.

Configure Email Service for `sgolaunch.com` and verify your inquiry destination before deploying. Set `CONTACT_TO` privately in the Cloudflare dashboard to that verified destination, and `CONTACT_FROM` to `inquiries@sgolaunch.com`. Do not commit private destination addresses or credentials. The form posts to `/api/inquiry`; it never opens a visitor's email application. The API only returns success after the email binding accepts the message, and returns a visible error if delivery fails. Inquiry contents are not logged by the application.

Add `sgolaunch.com` (and optionally `www.sgolaunch.com`) under the Worker's Settings → Domains & Routes as custom domains after the initial deployment. Custom domains can also be declared in Wrangler after they are configured.

## External calculator

The district calculator is the Education Resource Strategies tool linked in the school district presentation. It is embedded from ERS with attribution and a direct open-in-new-tab link. ERS controls its data, assumptions, availability, and calculations.

## Content

Remote setup: $5,000 service fee, plus the $600 IRS Form 1023 user fee and applicable state incorporation fees paid by the client. In-person work adds agreed travel expenses and $1,000 per travel day. Chase Christensen is named only in the school-leader perspective section.
