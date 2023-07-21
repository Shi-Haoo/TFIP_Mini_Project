package miniProject.server.models;

public class UpdateOrderStatus {
    
    private String orderId;
    private String paymentStatus;
    private String deliveryStatus;
    
    public UpdateOrderStatus() {
    }


    public UpdateOrderStatus(String orderId, String paymentStatus, String deliveryStatus) {
        this.orderId = orderId;
        this.paymentStatus = paymentStatus;
        this.deliveryStatus = deliveryStatus;
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


    public String getOrderId() {
        return orderId;
    }


    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    @Override
    public String toString() {
        return "UpdateOrderStatus [orderId=" + orderId + ", paymentStatus=" + paymentStatus + ", deliveryStatus="
                + deliveryStatus + "]";
    }

    


    
}
