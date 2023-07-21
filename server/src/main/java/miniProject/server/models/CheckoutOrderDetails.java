package miniProject.server.models;

import java.util.List;

public class CheckoutOrderDetails {
    
    private String customerFirstName;
    private String customerLastName;
    private String email;
    private String contact;
    private String comments;
    private String paymentMode;
    private String paymentStatus;
    private List<Item> items;
    
    public CheckoutOrderDetails() {
    }

    public CheckoutOrderDetails(String customerFirstName, String customerLastName, String email, String contact, String comments,
            String paymentMode, String paymentStatus, List<Item> items) {
        this.customerFirstName = customerFirstName;
        this.customerLastName = customerLastName;
        this.email = email;
        this.contact = contact;
        this.comments = comments;
        this.paymentMode = paymentMode;
        this.paymentStatus = paymentStatus;
        this.items = items;
    }

    public String getCustomerFirstName() {
        return customerFirstName;
    }

    public void setCustomerFirstName(String customerFirstName) {
        this.customerFirstName = customerFirstName;
    }

    public String getCustomerLastName() {
        return customerLastName;
    }

    public void setCustomerLastName(String customerLastName) {
        this.customerLastName = customerLastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "CheckoutOrderDetails [customerFirstName=" + customerFirstName + ", customerLastName=" + customerLastName + ", email=" + email
                + ", contact=" + contact + ", comments=" + comments + ", paymentMode=" + paymentMode
                + ", paymentStatus=" + paymentStatus + ", items=" + items + "]";
    }

    

    
}
