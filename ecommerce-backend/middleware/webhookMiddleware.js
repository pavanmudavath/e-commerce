const crypto = require('crypto');
const getRawBody = require('raw-body');

exports.verifyWebhook = async (req, res, next) => {
    try {
        // Get the signature from headers
        const signature = req.headers['x-signature'];
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

        if (!signature || !secret) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Missing signature or secret' 
            });
        }

        // Get raw body as a string
        const rawBody = req.rawBody;
        if (!rawBody) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'No raw body found' 
            });
        }

        // Create HMAC using the secret
        const hmac = crypto.createHmac('sha256', secret);
        
        // Update HMAC with the raw body
        hmac.update(rawBody);
        
        // Get the computed signature
        const computedSignature = hmac.digest('hex');

        // Log for debugging
        console.log('Received Signature:', signature);
        console.log('Computed Signature:', computedSignature);

        // Compare signatures
        if (signature !== computedSignature) {
            console.log('Signature mismatch!');
            return res.status(401).json({ 
                status: 'fail', 
                message: 'Invalid signature' 
            });
        }

        // Parse the raw body into req.body
        req.body = JSON.parse(rawBody);
        next();
    } catch (error) {
        console.error('Webhook verification error:', error);
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Webhook verification failed' 
        });
    }
};