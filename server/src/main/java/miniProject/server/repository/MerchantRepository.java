package miniProject.server.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import miniProject.server.models.OrderRecord;
import miniProject.server.models.ProductDescription;
import miniProject.server.models.ProductImage;
import miniProject.server.models.ProductInfo;
import miniProject.server.models.UpdateOrderStatus;

import static miniProject.server.repository.DBQueries.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MerchantRepository {
    
    @Autowired 
    JdbcTemplate sqlTemplate; 

    public Integer updateProductDescription(ProductDescription pdtDeets){

        return sqlTemplate.update(UPDATE_PRODUCT_DESCRIPTION, pdtDeets.getProductDescription(), pdtDeets.getProductName());
    }


    public Integer updateOrderStatus(UpdateOrderStatus updatedStatus){

        return sqlTemplate.update(UPDATE_ORDER_STATUS_BY_ORDER_ID, updatedStatus.getPaymentStatus(),
                                                                    updatedStatus.getDeliveryStatus(),
                                                                    updatedStatus.getOrderId());
    }

    public void insertNewProductImage(String imageId, String imageFileName, byte[] image, String contentType){
        sqlTemplate.update(SQL_INSERT_IMAGE, imageId, imageFileName, image, contentType);
    }

    public Optional<ProductImage> getPdtImgByName(String imageName){
        
        return sqlTemplate.query(SQL_GET_IMAGE_BY_NAME,
        rs -> {
            if(!rs.next())
            return Optional.empty();

            return Optional.of(new ProductImage(rs.getString("imageFile_name"), rs.getString("image_type"), rs.getBytes("image")));
        }, imageName);
    }

    public List<OrderRecord> getAllOrderRecords(){
        
        List<OrderRecord> orderRecords = new ArrayList<>();
        
        SqlRowSet rs = sqlTemplate.queryForRowSet(GET__ALL_ORDER_RECORDS);

        while(rs.next()){
            OrderRecord orderRecord = new OrderRecord();

            orderRecord.setOrder_id(rs.getString("order_id"));
            orderRecord.setCustomerName(rs.getString("customer_name"));
            orderRecord.setEmail(rs.getString("customer_email"));
            orderRecord.setCustomerContact(rs.getString("customer_contact"));
            orderRecord.setOrderDate(rs.getDate("order_date"));
            orderRecord.setPaymentStatus(rs.getString("payment_status"));
            orderRecord.setDeliveryStatus(rs.getString("delivery_status"));
            orderRecord.setComments(rs.getString("comments"));
            orderRecord.setTotalPrice(rs.getDouble("total_price"));
            orderRecord.setQuantity(rs.getInt("quantity"));
            orderRecord.setProduct(rs.getString("name"));

            orderRecords.add(orderRecord);
        }

        return orderRecords;
    }

    public Optional<ProductInfo> getProductInfoByName(String itemName){

        SqlRowSet rs = sqlTemplate.queryForRowSet(GET_PRODUCT_INFO_BY_NAME, itemName);

        //since the intention for product name is to be unique in products table, there should only be 1 record based on the name. 
        //So we just use rs.first() to check if there is result in the first row of rs
        if(rs.first()){

            ProductInfo pdtInfo = new ProductInfo();
            
            pdtInfo.setProductId(rs.getInt("product_id"));
            pdtInfo.setProductName(rs.getString("name"));
            pdtInfo.setStandardPrice(rs.getDouble("standard_price"));
            pdtInfo.setDiscount(rs.getDouble("discount"));
            pdtInfo.setAvailability(rs.getString("availability"));
            pdtInfo.setDescription(rs.getString("description"));

            return Optional.of(pdtInfo);
        }

        return Optional.empty();
    }
}
