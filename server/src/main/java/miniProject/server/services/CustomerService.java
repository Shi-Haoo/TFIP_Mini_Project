package miniProject.server.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentUpdateParams;

import miniProject.server.models.CheckoutOrderDetails;
import miniProject.server.models.Item;
import miniProject.server.models.OrderRecord;
import miniProject.server.models.UpdateOrderStatus;
import miniProject.server.models.UpdatePaymentIntentRequest;
import miniProject.server.repository.CustomerRepository;

@Service
public class CustomerService {
    
    @Autowired
    CustomerRepository customerRepo;

    @Value("${stripe.secret}")
    private String stripeSecretKey;

    @Transactional(rollbackFor = DataAccessException.class)
    public String insertOrder(CheckoutOrderDetails cods) throws DataAccessException{
        
        //String orderId = customerRepo.insertPurchaseOrder(cods);

        String orderId = generateOrderId();

        customerRepo.insertPurchaseOrder(cods, orderId);
        customerRepo.insertOrderDetails(cods, orderId);

        return orderId;
    }

    public List<OrderRecord> getOrdersByIdAndDeliveryStatus(String orderId){

        return customerRepo.getOrdersByIdAndDeliveryStatus(orderId);
    }

    public Integer updateDeliveryStatusById(UpdateOrderStatus updatedStatus){

        return customerRepo.updateDeliveryStatusById(updatedStatus);
    }

    //PaymentIntent object contains properties which allow us to track the customer’s payment lifecycle, keeping track of 
    //any failed payment attempts and ensuring the customer is only charged once.
    public PaymentIntent createPaymentIntent(CheckoutOrderDetails codp) throws StripeException{

        //Set stripe secret key to make requests to Stripe API. Stripe API will authenticate request with our secret key.
        //The API endpoint to create PaymentIntent is https://api.stripe.com/v1/payment_intents
        //Remember to switch to live secret key in production for actual payment to take place.
        
        //use .trim to remove any whitespace. Otherwise will have error saying API key contains whitespace
        Stripe.apiKey = stripeSecretKey.trim();
        System.out.println("Stripe secret key >>>" + stripeSecretKey);

        long totalCheckOutCost = calculateTotalCost(codp);
        String orderId = generateOrderId();

        //Use Gson to convert Java Object to Json string vice versa
        //Gson gson = new Gson();

        //img url is very long. Try remove img url to make sure metadata stay within 500 characters limit
        // List<Item> items = codp.getItems();
        // for(Item item: items){
        //     item.setImgUrl("");
        // }


        PaymentIntentCreateParams params =
        PaymentIntentCreateParams.builder()
          .setAmount(totalCheckOutCost)
          .setCurrency("sgd")
          .setAutomaticPaymentMethods(
            //enabling automatic payment method enable cards and other common payment methods for you by default
            //Stripe evaluates the currency, payment method restrictions, and other parameters to determine the list of supported payment methods.
            //Automatically displays methods that is most relevant to the currency and customers' location
            PaymentIntentCreateParams.AutomaticPaymentMethods
              .builder()
              .setEnabled(true)
              .build()
          )
          .putMetadata("order_id", orderId)
          //.putMetadata("checkoutOrderDetails", gson.toJson(codp))
          .build();

        // Create a PaymentIntent with the order amount and currency
        PaymentIntent paymentIntent = PaymentIntent.create(params);

        return paymentIntent;

    }


    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException{
        
        Stripe.apiKey = stripeSecretKey.trim();
        System.out.println("Stripe secret key >>>" + stripeSecretKey);

        PaymentIntent paymentIntentRetrieved = PaymentIntent.retrieve(paymentIntentId);

        return paymentIntentRetrieved;
    }

    //calculate total cost of customer order in server as suggested by Stripe to prevent manipulation of total cost on client side
    public Long calculateTotalCost(CheckoutOrderDetails codp){

        long totalCheckoutCost = 0;
        for(Item item : codp.getItems()){
            //convert to cents so that can store as long value accurately for .setAmount()
            totalCheckoutCost += item.getTotalFinalPrice()*100;
        }

        
        System.out.println("total checkout cost for online payment >>> "+ totalCheckoutCost);

        return totalCheckoutCost;
    }

    public String generateOrderId(){
        
        UUID uuid = UUID.randomUUID();
        String orderId = uuid.toString().replace("-", "").substring(0, 8);

        return orderId;
    }

    //insert order to database when customer click on confirm payment on frontend
    @Transactional(rollbackFor = DataAccessException.class)
    public void insertOrderforOnlinePay(CheckoutOrderDetails codp, String orderId){

        customerRepo.insertPurchaseOrder(codp, orderId);
        customerRepo.insertOrderDetails(codp, orderId);
    }

    public Integer updatePaymentStatusbyId(String orderId, String paymentStatus){

        return customerRepo.updatePaymentStatusbyId(orderId, paymentStatus);
    }

    public Integer deleteOrderbyId(String orderId){
        
        return customerRepo.deleteOrderById(orderId);
    }

    public Optional<OrderRecord> getOrderById(String orderId){

        return customerRepo.getOrderById(orderId);
    }

    public PaymentIntent updatePaymentIntent(UpdatePaymentIntentRequest requestDetails) throws StripeException{
        
        //Use Gson to convert Java Object to Json string vice versa
        //Gson gson = new Gson();

        Stripe.apiKey = stripeSecretKey.trim();
        long totalCheckOutCost = calculateTotalCost(requestDetails.getCodp());

        PaymentIntent paymentIntentRetrieved = retrievePaymentIntent(requestDetails.getPaymentIntentId());
        
        //img url is very long. Try remove img url to make sure metadata stay within 500 characters limit
        // List<Item> items = requestDetails.getCodp().getItems();
        // for(Item item: items){
        //     item.setImgUrl("");
        // }

        PaymentIntentUpdateParams params = PaymentIntentUpdateParams.builder()
                    .setAmount(totalCheckOutCost) // Set the updated amount in cents
                    //.putMetadata("checkoutOrderDetails", gson.toJson(requestDetails.getCodp())) // Set the metadata field
                    .build();

        PaymentIntent updatedPaymentIntent = paymentIntentRetrieved.update(params);

        return updatedPaymentIntent;
    }

}
