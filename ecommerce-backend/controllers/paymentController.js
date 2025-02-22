const axios = require('axios');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/User');

// Lemon Squeezy API base URL
const LEMON_SQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1';

// Helper function to make API requests to Lemon Squeezy
const lemonSqueezyRequest = async (method, endpoint, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${LEMON_SQUEEZY_API_URL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            data,
        });
        return response.data;
    } catch (err) {
        throw new AppError(`Lemon Squeezy API Error: ${err.message}`, 500);
    }
};

// Create a subscription
exports.createSubscription = catchAsync(async (req, res, next) => {
    const { plan, userEmail, successUrl, cancelUrl } = req.body;

    // Determine variant ID
    const variantId = plan === 'monthly' 
        ? process.env.MONTHLY_PLAN_VARIANT_ID 
        : process.env.YEARLY_PLAN_VARIANT_ID;

    // Log the variant ID for debugging
    console.log('Selected Plan:', plan);
    console.log('Variant ID:', variantId);

    // Create checkout session with redirect URLs
    const checkout = await lemonSqueezyRequest('POST', '/checkouts', {
        data: {
            type: 'checkouts',
            attributes: {
                checkout_data: {
                    email: userEmail,
                },
                product_options: {
                    enabled_variants: [parseInt(variantId)], // Array of variant IDs
                    redirect_url: successUrl, // Redirect URL after successful payment
                    receipt_button_text: "Go to Dashboard", // Customize the receipt button text
                    receipt_thank_you_note: "Thank you for your purchase!" // Customize the thank you note
                }
            },
            relationships: {
                store: {
                    data: {
                        type: 'stores',
                        id: process.env.LEMON_SQUEEZY_STORE_ID,
                    },
                },
                variant: {
                    data: {
                        type: 'variants',
                        id: variantId,
                    },
                },
            },
        },
    });

    // Send the checkout URL to the client
    res.status(200).json({
        status: 'success',
        data: {
            checkoutUrl: checkout.data.attributes.url,
        },
    });
});

// Handle Lemon Squeezy webhook events
exports.handleWebhook = catchAsync(async (req, res, next) => {
    const event = req.body;
    
    // Log the incoming event for debugging
    console.log('Webhook Event:', event.meta.event_name);
    console.log('Event Data:', JSON.stringify(event.data, null, 2));

    switch (event.meta.event_name) {
        case 'order_created':
            await handleOrderCreated(event.data);
            break;
            
        case 'subscription_created':
            await handleSubscriptionCreated(event.data);
            break;
            
        case 'subscription_updated':
            await handleSubscriptionUpdated(event.data);
            break;
            
        case 'subscription_cancelled':
            await handleSubscriptionCancelled(event.data);
            break;
            
        default:
            console.log(`Unhandled event type: ${event.meta.event_name}`);
    }

    res.status(200).json({ status: 'success' });
});

// Handle order_created event
async function handleOrderCreated(data) {
    const { user_email, first_order_item } = data.attributes;

    // Log the variant_id for debugging
    console.log('Variant ID:', first_order_item.variant_id);
    console.log('Monthly Plan Variant ID:', process.env.MONTHLY_PLAN_VARIANT_ID);
    console.log('Yearly Plan Variant ID:', process.env.YEARLY_PLAN_VARIANT_ID);

    try {
        const user = await User.findOne({ email: user_email });
        if (!user) {
            console.error(`User not found for email: ${user_email}`);
            return;
        }

        // Determine the plan type based on the variant ID
        const isYearlyPlan = first_order_item.variant_id === parseInt(process.env.YEARLY_PLAN_VARIANT_ID);
        const planType = isYearlyPlan ? 'yearly' : 'monthly';

        // Log the determined plan type
        console.log('Determined Plan Type:', planType);

        // Calculate the subscription end date
        const subscriptionDuration = isYearlyPlan
            ? 365 * 24 * 60 * 60 * 1000 // 1 year
            : 30 * 24 * 60 * 60 * 1000; // 1 month

        const updates = {
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(Date.now() + subscriptionDuration),
            planType, // Set the plan type
            updatedAt: new Date(),
        };

        const updatedUser = await User.findOneAndUpdate(
            { email: user_email },
            { $set: updates },
            { new: true }
        );

        console.log('Updated user subscription:', updatedUser);
    } catch (error) {
        console.error('Error processing order:', error);
        throw error;
    }
}
// Handle subscription_created event
async function handleSubscriptionCreated(data) {
    const { user_email, ends_at } = data.attributes;
    
    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: user_email },
            {
                $set: {
                    subscriptionStatus: 'active',
                    subscriptionEndDate: ends_at ? new Date(ends_at) : null,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
        
        console.log('Updated subscription status:', updatedUser);
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
}

// Handle subscription_updated event
async function handleSubscriptionUpdated(data) {
    const { user_email, ends_at, status } = data.attributes;
    
    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: user_email },
            {
                $set: {
                    subscriptionStatus: status === 'active' ? 'active' : 'inactive',
                    subscriptionEndDate: ends_at ? new Date(ends_at) : null,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
        
        console.log('Updated subscription:', updatedUser);
    } catch (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }
}

// Handle subscription_cancelled event
async function handleSubscriptionCancelled(data) {
    const { user_email } = data.attributes;
    
    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: user_email },
            {
                $set: {
                    subscriptionStatus: 'cancelled',
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
        
        console.log('Cancelled subscription:', updatedUser);
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
    }
}
// Fetch current subscription for the logged-in user
exports.getCurrentSubscription = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Determine the plan name based on the planType field
    const planName = user.planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan';

    // Fetch subscription data from the database
    const subscription = {
        plan_name: planName,
        status: user.subscriptionStatus,
        current_period_end: user.subscriptionEndDate,
    };

    res.status(200).json({
        status: 'success',
        data: {
            subscription,
        },
    });
});