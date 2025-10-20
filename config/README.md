# CyberBuddy Configuration Files

This directory contains deployment and infrastructure configuration files for the CyberBuddy project.

## 🔧 Configuration Files

### Cloud Platform Configurations

#### `render.yaml`
Configuration for deploying to [Render.com](https://render.com).

**Features:**
- Automated deployments from git
- Environment variable management
- Service scaling configuration

**See:** `../docs/RENDER_DEPLOYMENT_GUIDE.md` for deployment instructions

#### `vercel.json`
Configuration for deploying frontend to [Vercel](https://vercel.com).

**Features:**
- Routing rules
- Build configuration
- Environment variables
- Redirects and rewrites

## 📋 Usage Guide

### Render Deployment

1. Connect your GitHub repository to Render
2. Point to `config/render.yaml` in Render dashboard
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

See `../docs/RENDER_DEPLOYMENT_GUIDE.md` for detailed steps.

### Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run from project root: `vercel`
3. Follow prompts to deploy

Or connect GitHub repository to Vercel dashboard for automatic deployments.

## 🔒 Security Notes

- Never commit sensitive data (API keys, passwords) to these files
- Use environment variables for secrets
- Review and update CORS settings for production
- Enable HTTPS in production environments
- Restrict database access to necessary IPs

## 🔄 Updating Configurations

When modifying configuration files:
1. Test locally first
2. Update documentation if behavior changes
3. Notify team members of breaking changes
4. Update environment variables on deployed services
5. Monitor deployments for issues

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- Project deployment guide: `../docs/DEPLOYMENT.md`
