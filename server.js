if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const fs = require('fs')

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())   // IMPORTANT

// Store Page
app.get('/store', (req, res) => {
    fs.readFile('items.json', (err, data) => {
        if (err) {
            res.status(500).end()
        } else {
            res.render('store.ejs', {
                items: JSON.parse(data)
            })
        }
    })
})

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',

            line_items: req.body.items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price
                },
                quantity: item.quantity
            })),

        //     success_url: 'http://localhost:3000/success.html',
        //     cancel_url: 'http://localhost:3000/cancel.html'
        success_url: 'http://localhost:3000/store?success=true',
        cancel_url: 'http://localhost:3000/store?cancel=true'
        })

        res.json({ url: session.url })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
})

app.listen(3000, () => {
    console.log('Server running on port 3000')
})
