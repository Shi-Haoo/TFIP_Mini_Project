package miniProject.server.models;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public class ProductInfo {
    
    private int productId;
    private String productName;
    private Double standardPrice;
    private Double discount;
    private String availability;
    private String description;
    
    public ProductInfo() {
    }

    public ProductInfo(int productId, String productName, Double standardPrice, Double discount, String availability,
            String description) {
        this.productId = productId;
        this.productName = productName;
        this.standardPrice = standardPrice;
        this.discount = discount;
        this.availability = availability;
        this.description = description;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Double getStandardPrice() {
        return standardPrice;
    }

    public void setStandardPrice(Double standardPrice) {
        this.standardPrice = standardPrice;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    

    @Override
    public String toString() {
        return "ProductInfo [productId=" + productId + ", productName=" + productName + ", standardPrice="
                + standardPrice + ", discount=" + discount + ", availability=" + availability + ", description="
                + description + "]";
    }

    public JsonObject toJson(){
        
        return Json.createObjectBuilder()
                .add("productId", this.getProductId())
                .add("productName", this.getProductName())
                .add("standardPrice", this.getStandardPrice())
                .add("discount", this.getDiscount())
                .add("availability", this.getAvailability())
                .add("description", this.getDescription())
                .build();
    }

    
    

    
}
