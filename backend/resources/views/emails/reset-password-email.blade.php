<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 0;
            margin: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .header {
            background: linear-gradient(135deg, #CD5700 0%, #ffa333 100%);
            padding: 30px 20px;
            text-align: center;
        }

        .logo {
            color: #ffffff;
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .content {
            padding: 40px 30px;
            text-align: center;
        }

        h1 {
            font-size: 28px;
            color: #1a1a1a;
            margin-bottom: 25px;
            font-weight: 600;
        }

        .message {
            font-size: 15px;
            color: #4a4a4a;
            line-height: 1.6;
            margin-bottom: 30px;
            text-align: center;
        }

        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #CD5700 0%, #ffa333 100%);
            color: #ffffff;
            padding: 14px 40px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            border-radius: 3px;
            margin: 10px 0 30px 0;
            transition: opacity 0.3s;
        }

        .reset-button:hover {
            opacity: 0.9;
        }

        .expiry-notice {
            font-size: 14px;
            color: #666666;
            margin-bottom: 25px;
            padding: 12px 20px;
            background-color: #fff5e6;
            border-radius: 4px;
            display: inline-block;
        }

        .expiry-notice strong {
            color: #CD5700;
        }

        .alternative-text {
            font-size: 13px;
            color: #666666;
            margin-bottom: 15px;
            margin-top: 30px;
        }

        .url-link {
            font-size: 12px;
            color: #0066cc;
            word-break: break-all;
            display: block;
            margin: 0 auto;
            max-width: 90%;
            text-decoration: none;
        }

        .security-notice {
            font-size: 13px;
            color: #666666;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid #e5e5e5;
        }

        .footer {
            background-color: #fafafa;
            padding: 25px 20px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }

        .footer-links {
            margin-bottom: 15px;
        }

        .footer-link {
            color: #666666;
            text-decoration: none;
            font-size: 13px;
            margin: 0 15px;
            display: inline-block;
        }

        .footer-link:hover {
            text-decoration: underline;
        }

        .copyright {
            font-size: 12px;
            color: #999999;
            margin-top: 10px;
        }

        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }

            h1 {
                font-size: 24px;
            }

            .footer-link {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header with Logo -->
        <div class="header">
            <div class="logo">{{ $appName }}</div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h1>Password Reset Request</h1>

            <p class="message">
                You are receiving this email because we received a password reset request for your account. Please click below to reset your password:
            </p>

            <a href="{{ $resetUrl }}" class="reset-button">Reset Password</a>

            <div class="expiry-notice">
                ⏰ This link will expire in <strong>{{ $expiryMinutes }} minutes</strong>
            </div>

            <p class="alternative-text">
                If this doesn't work, copy and paste the following link into your browser:
            </p>

            <a href="{{ $resetUrl }}" class="url-link">{{ $resetUrl }}</a>

            <p class="security-notice">
                If you did not request a password reset, no further action is required. Your account remains secure.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="#" class="footer-link">Contact Us</a>
                <a href="#" class="footer-link">Terms & Conditions</a>
                <a href="#" class="footer-link">Privacy Policy</a>
            </div>
            <p class="copyright">
                © {{ $year }} {{ $appName }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
