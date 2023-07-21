package miniProject.server.models;

public class UpdatePaymentIntentRequest {
    
    private String paymentIntentId;
    private CheckoutOrderDetails codp;
    
    public UpdatePaymentIntentRequest() {
    }

    public UpdatePaymentIntentRequest(String paymentIntentId, CheckoutOrderDetails codp) {
        this.paymentIntentId = paymentIntentId;
        this.codp = codp;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public CheckoutOrderDetails getCodp() {
        return codp;
    }

    public void setCodp(CheckoutOrderDetails codp) {
        this.codp = codp;
    }

    @Override
    public String toString() {
        return "UpdatePaymentIntentRequest [paymentIntentId=" + paymentIntentId + ", codp=" + codp + "]";
    }

    
    
}
