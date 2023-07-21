package miniProject.server.models;

import java.util.Date;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public class OrderRecord {

    private String order_id;
    private String customerName;
    private String email;
    private String customerContact;
    private Date orderDate;
    private String paymentStatus;
    private String deliveryStatus;
    private String comments;
    private Double totalPrice;
    private int quantity;
    private String product;
    
    public OrderRecord() {
    }

    public OrderRecord(String order_id, String customerName, String email, String customerContact, Date orderDate, String paymentStatus,
            String deliveryStatus, String comments, Double totalPrice, int quantity, String product) {
        this.order_id = order_id;
        this.customerName = customerName;
        this.email = email;
        this.customerContact = customerContact;
        this.orderDate = orderDate;
        this.paymentStatus = paymentStatus;
        this.deliveryStatus = deliveryStatus;
        this.comments = comments;
        this.totalPrice = totalPrice;
        this.quantity = quantity;
        this.product = product;
    }

    public String getOrder_id() {
        return order_id;
    }

    public void setOrder_id(String order_id) {
        this.order_id = order_id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCustomerContact() {
        return customerContact;
    }

    public void setCustomerContact(String customerContact) {
        this.customerContact = customerContact;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    @Override
    public String toString() {
        return "OrderRecord [order_id=" + order_id + ", customerName=" + customerName + ", email=" + email
                + ", customerContact=" + customerContact + ", orderDate=" + orderDate + ", paymentStatus="
                + paymentStatus + ", deliveryStatus=" + deliveryStatus + ", comments=" + comments + ", totalPrice="
                + totalPrice + ", quantity=" + quantity + ", product=" + product + "]";
    }

    public JsonObject toJson(){
        
        return Json.createObjectBuilder()
                .add("order_id", this.getOrder_id())
                .add("customer_name", this.getCustomerName())
                .add("customer_email", this.getEmail())
                .add("customer_contact", this.getCustomerContact())
                .add("order_date", this.getOrderDate().toString())
                .add("payment_status", this.getPaymentStatus())
                .add("delivery_status", this.getDeliveryStatus())
                .add("comments", this.getComments())
                .add("total_price", this.getTotalPrice())
                .add("quantity", this.getQuantity())
                .add("product", this.getProduct())
                .build();

    }

    public JsonObject toJsonForCustomer(){

        return Json.createObjectBuilder()
                .add("order_id", this.getOrder_id())
                .add("customer_name", this.getCustomerName())
                .add("order_date", this.getOrderDate().toString())
                .add("delivery_status", this.getDeliveryStatus())
                .add("total_price", this.getTotalPrice())
                .add("quantity", this.getQuantity())
                .add("product", this.getProduct())
                .add("payment_status", this.getPaymentStatus())
                .build();
    }
    

    
}
