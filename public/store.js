const params = new URLSearchParams(window.location.search)

if (params.get('success')) {
    alert('Payment Successful ✅')
}

if (params.get('cancel')) {
    alert('Payment Cancelled ❌')
}
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}
// var stripHandler = StripeCheckout.configure({
//     key: stripePublicKey,
//     locale: 'en',
//     token:function(token) {

//     }
// })
// function purchaseClicked() {
//     // alert('Thank you for your purchase')
//     // var cartItems = document.getElementsByClassName('cart-items')[0]
//     // while (cartItems.hasChildNodes()) {
//     //     cartItems.removeChild(cartItems.firstChild)
//     // }
//     // updateCartTotal()
//     var priceElement = document.getElementsByClassName('cart-total-price')[0]
//     var price = parseFloat(priceElement.innerText.replace('$',''))*100
//     stripHandler.open({
//         amount: price
//     })
// }
function purchaseClicked() {

    const items = getCartItems()

    if (items.length === 0) {
        alert('Your cart is empty!')
        return
    }

    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: items
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.url) {
            window.location.href = data.url
        } else {
            alert('Payment failed')
        }
    })
    .catch(err => {
        console.error(err)
        alert('Something went wrong')
    })
}
function getCartItems() {

    const cartRows = document
        .getElementsByClassName('cart-items')[0]
        .getElementsByClassName('cart-row')

    const items = []

    for (let i = 0; i < cartRows.length; i++) {

        const row = cartRows[i]

        const title =
            row.getElementsByClassName('cart-item-title')[0].innerText

        const priceText =
            row.getElementsByClassName('cart-price')[0].innerText

        const quantity =
            row.getElementsByClassName('cart-quantity-input')[0].value

        const price = parseFloat(priceText.replace('$', '')) * 100

        items.push({
            name: title,
            price: Math.round(price),
            quantity: Number(quantity)
        })
    }

    return items
}


function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
}

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    addItemToCart(title, price, imageSrc)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}