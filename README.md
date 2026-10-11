# Kino XII

Cinema booking app built for Redberry Bootcamp XII. Browse films and live events, filter sessions across four halls, pick seats on the live hall map and buy tickets.

**Live:** https://ekali-star.github.io/kinoxii/

## Features

- Login and registration modals with avatar preview, resuming the protected action after sign in
- Home page with animated featured hero, Now Playing, Coming Soon (Notify me) and recently viewed
- Sessions page with venue, date, format, language and time of day filters, sorting, pagination and full URL state
- Movie details page with sessions by venue and an age gate from the profile date of birth
- Two step booking modal: API driven seat map, ticket types, 8 minute hold timer, 409 seat conflict recovery, checkout and confirmation
- Profile page with personal info validation, completeness status and My Tickets with refunds
- Navbar search across films and events

## Stack

React 19, TypeScript, Vite, React Router, TanStack Query.

## Running locally

```bash
npm install
npm run dev
```

The API defaults to `https://api.kinoxii.redberryinternship.ge/api` and can be overridden with `VITE_API_URL`.

Pushes to `main` deploy to GitHub Pages through `.github/workflows/deploy.yml`.
