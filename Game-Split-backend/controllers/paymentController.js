// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/bookingModel'); // We'll need this later

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay Order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };

        const order = await instance.orders.create(options);

        if (!order) {
            return res.status(500).send("Some error occurred");
        }

        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

// @desc    Verify payment and create booking
// @route   POST /api/payments/verify-payment
exports.verifyPayment = async (req, res) => {
    const {
        order_id,
        payment_id,
        signature,
        amount,
        courtId,
        date,
        startTime,
        endTime,
    } = req.body;

    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(order_id + "|" + payment_id)
        .digest('hex');

    if (generated_signature !== signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // If payment is verified, create the booking in the database
    try {
         await Booking.create({
            court: courtId,
            player: req.user.id, // from auth middleware
            date,
            startTime,
            endTime,
            totalPrice: amount,
            status: 'Confirmed',
        });

        res.status(201).json({ success: true, message: 'Booking successful!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save booking', error: error.message });
    }
};