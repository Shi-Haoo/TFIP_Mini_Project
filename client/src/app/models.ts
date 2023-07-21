
export interface registerRequest{
    username: string
    password: string
    email: string
}

export interface loginRequest{
    username: string
    password: string
}

export interface loginResponse{
    username: string
    token: string
    userRole: string
}

export interface updateDescriptionRequest{
    productName: string
    productDescription: string
}

export interface OrderData{

    order_id: string
    customer_name: string
    customer_email: string
    customer_contact: string
    order_date: Date
    payment_status: string  
    delivery_status: string
    comments: string
    total_price: number
    quantity: number
    product: string
    
}

export interface UpdateOrderStatus{
    orderId: string
    paymentStatus: string
    deliveryStatus: string
}

export interface ProductInfo{
    productId: number
    productName: string
    standardPrice: number
    discount: number
    availability: string
    description: string
}

export interface Item{

    productId: number
    productName: string
    quantity: number
    standardPrice: number
    discount: number
    totalFinalPrice: number
    transformedProductName: string
    imgFileName: string
    imgUrl: string
    
}

export interface CheckoutOrderDetails{
    firstName: string
    lastName: string
    email: string
    contact: string
    comments: string
    paymentMode: string
    paymentStatus: string
    items: Item[]
}