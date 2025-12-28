# CryptoCash 2.0 - Migration Instructions

This guide explains how to migrate the CryptoCash 2.0 application from one machine to another.

## Prerequisites for Target Machine

Before migrating, ensure the target machine has the following installed:

- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- [npm](https://www.npmjs.com/) (v8.x or higher) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/) (optional, but recommended for version control)

## Migration Steps

### 1. Package the Project

On the source machine, create a compressed archive of the project:

**Option A: Using ZIP**
```bash
# Navigate to the parent directory
cd /path/to/parent/directory

# Create a ZIP file (excluding node_modules and build artifacts)
zip -r cryptocash-2.0.zip rugs-fun-clone \
  -x "rugs-fun-clone/node_modules/*" \
  -x "rugs-fun-clone/dist/*" \
  -x "rugs-fun-clone/.vite/*" \
  -x "rugs-fun-clone/tsconfig.tsbuildinfo"
```

**Option B: Using TAR (Linux/macOS)**
```bash
# Navigate to the parent directory
cd /path/to/parent/directory

# Create a tar.gz file (excluding unnecessary files)
tar -czf cryptocash-2.0.tar.gz rugs-fun-clone \
  --exclude="rugs-fun-clone/node_modules" \
  --exclude="rugs-fun-clone/dist" \
  --exclude="rugs-fun-clone/.vite" \
  --exclude="rugs-fun-clone/tsconfig.tsbuildinfo"
```

### 2. Transfer the Archive

Transfer the archive file to the target machine using one of these methods:

- **USB Drive**: Copy the archive to a USB drive and transfer
- **Cloud Storage**: Upload to Google Drive, Dropbox, OneDrive, etc.
- **Network Transfer**: Use `scp`, `rsync`, or similar tools
- **Email**: If the file size is small enough

### 3. Extract on Target Machine

On the target machine, extract the archive:

**For ZIP files:**
```bash
# Extract the ZIP file
unzip cryptocash-2.0.zip

# Or use your system's GUI file manager
```

**For TAR files:**
```bash
# Extract the tar.gz file
tar -xzf cryptocash-2.0.tar.gz
```

### 4. Navigate to Project Directory

```bash
cd rugs-fun-clone
```

### 5. Install Dependencies

Install all project dependencies:

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm:**
```bash
pnpm install
```

This step will:
- Download all required packages listed in `package.json`
- Create a new `node_modules` folder
- Generate a new lock file (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`)

### 6. Verify Installation

Run the development server to ensure everything works:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application should start and be accessible at `http://localhost:5173`

## Files to Include in Migration

✅ **Include these files/folders:**
- `src/` - Source code
- `public/` - Static assets
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - Component configuration
- `biome.json` - Biome configuration
- `index.html` - Main HTML file
- `README.md` - Documentation
- `netlify.toml` - Deployment configuration (if using Netlify)

❌ **Exclude these files/folders:**
- `node_modules/` - Dependencies (will be reinstalled)
- `dist/` - Build output (will be regenerated)
- `.vite/` - Vite cache
- `tsconfig.tsbuildinfo` - TypeScript build cache
- `bun.lock` - Lock file (will be regenerated)

## Troubleshooting

### Common Issues and Solutions

1. **Permission Errors (Linux/macOS)**
   ```bash
   # Fix permissions if needed
   chmod -R 755 rugs-fun-clone
   ```

2. **Node Version Mismatch**
   - Ensure Node.js version is v16 or higher
   - Use a Node version manager like `nvm` if needed:
   ```bash
   nvm install 18
   nvm use 18
   ```

3. **Package Installation Fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete any existing lock files and try again
   - Use a different package manager (npm, yarn, or pnpm)

4. **TypeScript Errors**
   - Ensure TypeScript is installed globally or use the project's version
   - Run `npm run lint` to check for code issues

5. **Port Already in Use**
   - The dev server will automatically find an available port
   - Or specify a different port: `npm run dev -- --port 3000`

## Verification Checklist

After migration, verify these features work:

- [ ] Application starts without errors
- [ ] Chart displays and animates properly
- [ ] Buy/Sell buttons are functional
- [ ] Betting system works (place bets, cash out)
- [ ] Game crashes and restarts automatically
- [ ] All UI components render correctly
- [ ] Navigation between pages works

## Additional Notes

- **No Database Required**: This application runs entirely in the browser with no backend dependencies
- **No Environment Variables**: No `.env` files are required for basic functionality
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Browser Compatibility**: Supports modern browsers (Chrome, Firefox, Safari, Edge)

## Support

If you encounter issues during migration:

1. Check the console for error messages
2. Verify all dependencies installed correctly
3. Ensure Node.js version compatibility
4. Try deleting `node_modules` and reinstalling dependencies
5. Check that all required files were transferred correctly

## Building for Production

After successful migration, you can build for production:

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.
