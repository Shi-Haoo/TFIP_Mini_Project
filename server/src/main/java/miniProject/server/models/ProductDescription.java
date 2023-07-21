package miniProject.server.models;

public class ProductDescription {
    
    private String productName;
    private String productDescription;
    
    public ProductDescription() {
    }

    public ProductDescription(String productName, String productDescription) {
        this.productName = productName;
        this.productDescription = productDescription;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    @Override
    public String toString() {
        return "ProductDescription [productName=" + productName + ", productDescription=" + productDescription + "]";
    }
    
    
    
}
