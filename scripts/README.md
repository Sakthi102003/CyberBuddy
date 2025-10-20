# CyberBuddy Scripts

This directory contains deployment and utility scripts for the CyberBuddy project.

## 📜 Available Scripts

### Deployment Scripts

#### `deploy.sh` (Linux/macOS)
Unix/Linux deployment script for production environments.

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

#### `deploy.bat` (Windows)
Windows deployment script for production environments.

**Usage:**
```cmd
deploy.bat
```

#### `deploy-check.sh` (Linux/macOS)
Pre-deployment verification script to check environment and configuration.

**Usage:**
```bash
chmod +x deploy-check.sh
./deploy-check.sh
```

#### `start.sh` (Linux/macOS)
Application startup script for Unix-based systems.

**Usage:**
```bash
chmod +x start.sh
./start.sh
```

## 🔧 Configuration

Before running deployment scripts, ensure you have:
- Set up environment variables (see `../backend/.env`)
- Configured Firebase (see `../docs/setup_firebase.md`)
- Installed all dependencies
- Verified database connections

## 📝 Notes

- Always run `deploy-check.sh` before deploying to catch configuration issues
- Scripts assume they are run from the project root directory
- For Windows users: Use PowerShell or Git Bash to run `.sh` scripts, or use the `.bat` equivalent
- Check the `../docs/DEPLOYMENT.md` for detailed deployment instructions

## 🚨 Troubleshooting

If scripts fail to execute:
1. Check file permissions: `chmod +x *.sh`
2. Verify environment variables are set
3. Ensure all dependencies are installed
4. Check logs for specific error messages
5. Refer to `../docs/DEPLOYMENT.md` for common issues
