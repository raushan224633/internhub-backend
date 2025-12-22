# Email Configuration Guide for Contact Form

## Overview
Contact form se aane wale messages ab email ke through bhi receive honge. Messages database mein save bhi honge aur email bhi jayega.

## Email Setup Steps

### Option 1: Gmail Setup (Recommended for Development)

1. **Gmail Account banao ya use karo**
   - Ek Gmail account use karenge (e.g., `support@internshell.com` ya apna personal)

2. **2-Factor Authentication Enable karo**
   - Gmail Settings → Security
   - 2-Step Verification ko ON karo

3. **App Password Generate karo**
   - Google Account Settings → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Select app: "Mail"
   - Select device: "Other" (name it: "InternShell Backend")
   - 16-digit password mil jayega (e.g., `abcd efgh ijkl mnop`)

4. **.env file mein add karo**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ADMIN_EMAIL=support@internshell.com
   ```

### Option 2: Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Custom SMTP Server
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=support@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Environment Variables Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server address | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port (587 for TLS, 465 for SSL) | `587` |
| `EMAIL_SECURE` | Use SSL (true for port 465) | `false` |
| `EMAIL_USER` | Email account username | `support@internshell.com` |
| `EMAIL_PASSWORD` | Email account password or app password | `abcd efgh ijkl mnop` |
| `ADMIN_EMAIL` | Email where contact forms will be sent | `admin@internshell.com` |

## Email Features

### 1. Admin Notification Email
- Jab bhi koi contact form submit karta hai
- Admin ko professional formatted email milta hai
- Includes: Name, Email, Subject, Message, Timestamp
- Reply-to set hai user ke email pe

### 2. Auto-Reply to User
- User ko instant acknowledgment email milta hai
- Professional branded template
- Confirms message received
- Sets expectations (24-48 hours response time)

## Testing

### Without Email Setup
- Emails nahi jayenge (safe)
- Messages database mein save honge
- Console mein warning dikhayi degi
- API response success hoga

### With Email Setup
```bash
# Backend server start karo
cd backend
npm run dev

# Frontend se contact form fill karo
# Check:
# 1. Database mein message save hua?
# 2. Admin email mila?
# 3. User ko auto-reply email mila?
```

## Troubleshooting

### Error: "Invalid login"
- Check EMAIL_USER and EMAIL_PASSWORD correct hai
- Gmail: App Password use kar rahe ho? (not regular password)
- 2-Factor Authentication enabled hai?

### Error: "Connection timeout"
- Check EMAIL_HOST aur EMAIL_PORT correct hai
- Firewall email port ko block to nahi kar raha?

### Emails nahi aa rahe (but no errors)
- Spam/Junk folder check karo
- ADMIN_EMAIL correct hai?
- Email provider ki sending limits check karo

## Production Setup

### Recommended: Professional Email Service
Production mein in services ko use karo:
1. **SendGrid** (free tier: 100 emails/day)
2. **Mailgun** (free tier: 5000 emails/month)
3. **AWS SES** (pay as you go)
4. **Zoho Mail** (professional email hosting)

### SendGrid Example
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
ADMIN_EMAIL=support@internshell.com
```

## Important Notes

1. **Security**: `.env` file ko **NEVER** git mein commit na karo
2. **App Passwords**: Regular password se zyada secure hai
3. **Rate Limits**: Gmail free account: ~500 emails/day
4. **Production**: Professional email service use karo
5. **Backup**: Messages database mein bhi save hote hain (even if email fails)

## Support

Agar koi issue aa raha hai:
1. Console logs check karo
2. Email credentials verify karo
3. Test with different email provider
4. Check firewall settings

## Email Templates

Templates already included:
- ✅ Professional HTML design
- ✅ Mobile responsive
- ✅ Branded with InternShell colors
- ✅ Clear call-to-action
- ✅ Contact information
- ✅ Fallback plain text version

## Next Steps

1. Email credentials setup karo
2. Server restart karo
3. Contact form test karo
4. Verify emails aa rahe hain
5. Production mein professional service setup karo
