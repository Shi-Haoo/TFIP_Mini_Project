package miniProject.server.models;

//For item checkout by customer
public class Item {
    
    private int productId;
    private String productName;
    private int quantity;
    private Double standardPrice;
    private Double discount;
    private Double totalFinalPrice;
    private String transformedProductName;
    private String imgFileName;
    private String imgUrl;
    
    public Item() {
    }

    public Item(int productId, String productName, int quantity, Double standardPrice, Double discount,
            Double totalFinalPrice, String transformedProductName, String imgFileName, String imgUrl) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.standardPrice = standardPrice;
        this.discount = discount;
        this.totalFinalPrice = totalFinalPrice;
        this.transformedProductName = transformedProductName;
        this.imgFileName = imgFileName;
        this.imgUrl = imgUrl;
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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public Double getTotalFinalPrice() {
        return totalFinalPrice;
    }

    public void setTotalFinalPrice(Double totalFinalPrice) {
        this.totalFinalPrice = totalFinalPrice;
    }

    public String getTransformedProductName() {
        return transformedProductName;
    }

    public void setTransformedProductName(String transformedProductName) {
        this.transformedProductName = transformedProductName;
    }

    public String getImgFileName() {
        return imgFileName;
    }

    public void setImgFileName(String imgFileName) {
        this.imgFileName = imgFileName;
    }

    public String getImgUrl() {
        return imgUrl;
    }

    public void setImgUrl(String imgUrl) {
        this.imgUrl = imgUrl;
    }

    @Override
    public String toString() {
        return "Item [productId=" + productId + ", productName=" + productName + ", quantity=" + quantity
                + ", standardPrice=" + standardPrice + ", discount=" + discount + ", totalFinalPrice=" + totalFinalPrice
                + ", transformedProductName=" + transformedProductName + ", imgFileName=" + imgFileName + ", imgUrl="
                + imgUrl + "]";
    }

    

    
}
