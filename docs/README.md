# Discord MCP Documentation

This directory contains the VitePress documentation for Discord MCP.

## Development

To run the documentation site locally:

```bash
npm run docs:dev
```

This will start a local development server at `http://localhost:5173`.

## Building

To build the documentation for production:

```bash
npm run docs:build
```

The built files will be in `docs/.vitepress/dist/`.

## Preview

To preview the production build locally:

```bash
npm run docs:preview
```

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow is defined in `.github/workflows/deploy-docs.yml`.

## Structure

- `/docs/` - Documentation markdown files
- `/docs/.vitepress/` - VitePress configuration and theme
- `/docs/guide/` - Getting started guides
- `/docs/api/` - API reference documentation