package miniProject.server.repository;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import miniProject.server.models.CheckoutOrderDetails;
import miniProject.server.models.Item;
import miniProject.server.models.OrderRecord;
import miniProject.server.models.UpdateOrderStatus;

import static miniProject.server.repository.DBQueries.*;

@Repository
public class CustomerRepository {

    @Autowired
    JdbcTemplate sqlTemplate;
    
    public void insertPurchaseOrder(CheckoutOrderDetails cods, String orderId){

        // UUID uuid = UUID.randomUUID();
        // String orderId = uuid.toString().replace("-", "").substring(0, 8);

        sqlTemplate.update(INSERT_PURCHASE_ORDER, orderId, new Date(), cods.getCustomerFirstName()+" "+cods.getCustomerLastName(), cods.getEmail(), cods.getContact(), cods.getComments(), cods.getPaymentStatus(), "not made yet");

        //return orderId;
    }

    public void insertOrderDetails(CheckoutOrderDetails cods, String orderId){

        List<Item> itemList = cods.getItems();

        //set up the list of Object[] that will be used to replace 
        //query parameter '?' in the sql query statement

        List<Object[]> data = itemList.stream()
                    .map(item -> {
                        Object[] obj = new Object[5];
                        obj[0] = orderId;
                        obj[1] = item.getQuantity();
                        obj[2] = item.getStandardPrice();
                        obj[3] = item.getDiscount();
                        obj[4] = item.getProductId();

                        return obj;
                    }).toList();
                
        //insert multiple items record from a specific  
        //checkout order into order_details table

        sqlTemplate.batchUpdate(INSERT_ORDER_DETAILS, data);
    }

    public List<OrderRecord> getOrdersByIdAndDeliveryStatus(String orderId){
    List<OrderRecord> orderRecords = new ArrayList<>();
    SqlRowSet rs = sqlTemplate.queryForRowSet(GET_ORDER_BY_ID_AND_DELIVERY_STATUS, orderId);
   
    while(rs.next()){
            OrderRecord orderRecord = new OrderRecord();

            orderRecord.setOrder_id(rs.getString("order_id"));
            orderRecord.setCustomerName(rs.getString("customer_name"));
            orderRecord.setOrderDate(rs.getDate("order_date"));
            orderRecord.setDeliveryStatus(rs.getString("delivery_status"));
            orderRecord.setTotalPrice(rs.getDouble("total_price"));
            orderRecord.setQuantity(rs.getInt("quantity"));
            orderRecord.setProduct(rs.getString("name"));
            orderRecord.setPaymentStatus(rs.getString("payment_status"));
            orderRecords.add(orderRecord);
        }

        return orderRecords;

    }

    public Integer updateDeliveryStatusById(UpdateOrderStatus updatedStatus){

        return sqlTemplate.update(UPDATE_DELIVERY_STATUS_BY_ORDER_ID, updatedStatus.getDeliveryStatus(), updatedStatus.getOrderId());
    }

    public Integer updatePaymentStatusbyId(String orderId, String paymentStatus){

        return sqlTemplate.update(UPDATE_PAYMENT_STATUS_BY_ORDER_ID, paymentStatus, orderId);
    }

    public Integer deleteOrderById(String orderId){

        return sqlTemplate.update(DELETE_ORDER_BY_ORDER_ID, orderId);
    }

    public Optional<OrderRecord> getOrderById(String orderId){
        
        SqlRowSet rs = sqlTemplate.queryForRowSet(GET_ORDER_BY_ID, orderId);

        if(rs.first()){
            OrderRecord orderRecord = new OrderRecord();

            orderRecord.setOrder_id(rs.getString("order_id"));
            orderRecord.setCustomerName(rs.getString("customer_name"));
            orderRecord.setOrderDate(rs.getDate("order_date"));
            orderRecord.setDeliveryStatus(rs.getString("delivery_status"));
            orderRecord.setPaymentStatus(rs.getString("payment_status"));

            return Optional.of(orderRecord);
        }

        return Optional.empty();

    }
}
