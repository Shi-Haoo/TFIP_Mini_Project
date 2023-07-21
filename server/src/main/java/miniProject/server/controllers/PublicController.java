package miniProject.server.controllers;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.servlet.http.HttpSession;
import miniProject.server.exception.InvalidUserCredentialsException;
import miniProject.server.models.CheckoutOrderDetails;
import miniProject.server.models.OrderRecord;
import miniProject.server.models.ProductImage;
import miniProject.server.models.ProductInfo;
import miniProject.server.models.UpdateOrderStatus;
import miniProject.server.models.UpdatePaymentIntentRequest;
import miniProject.server.models.User;
import miniProject.server.models.UserRole;
import miniProject.server.security.authServices.UserAuthService;
import miniProject.server.security.jwt.JwtUtil;
import miniProject.server.services.CustomerService;
import miniProject.server.services.EmailService;
import miniProject.server.services.MerchantService;
import miniProject.server.vo.JwtRequest;
import miniProject.server.vo.JwtResponse;
import miniProject.server.vo.UserVo;


//need to check whether need to add @CrossOrigin for both PublicController and ProtectedController 
//and allowCredentials=true for ProtectedController even though Angular is served from SpringBoot

@RestController
@RequestMapping(path="/api/public")
public class PublicController {
    
    @Autowired
	JwtUtil jwtUtil;

	@Autowired
	UserAuthService userAuthService;

	@Autowired
	AuthenticationManager authenticationManager;

    @Autowired PasswordEncoder encoder;

    @Autowired
    MerchantService merchantSvc;

    @Autowired
    CustomerService customerSvc;

    @Autowired
    EmailService emailSvc;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    //to use this variable to send email to this merchant
    @Value("${spring.mail.username}")
    private String merchantEmail;

    //Email Subject for Order Confirmation
    private String confirmationEmailSubject = "Order Confirmation from Munch Kitchen";

    //Email Subject to Merchant for New Order
    private String newOrderEmailSubject = "New Order Received";

    //Email Subject for Unsuccessful Payment
    private String unsuccessfulPaymentEmailSubject = "Payment to Munch Kitchen Unsuccessful";

    @PostMapping(path="/signin")
    public ResponseEntity<String> authenticateUser(@RequestBody JwtRequest jwtRequest){

        try {
        //AuthenticationManager is an interface which is implemented by ProviderManager by default. It consists of a list of providers 
        //we can use to authenticate the user. It will either throw an exception or return a fully
        //populated Authentication object. In this case, I use DAOAuthenticationProvider which works 
        //well with form-based logins or HTTP Basic authentication. DAOAuthenticationProvider uses the 
        //help of UserDetailsService and PasswordEncoder. 
        //It authenticates the User simply by comparing the password submitted in a 
        //UsernamePasswordAuthenticationToken against the one loaded by the UserDetailsService 
			authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(jwtRequest.getUsername(), jwtRequest.getPassword()));
		}catch (BadCredentialsException e) {
			throw new InvalidUserCredentialsException("Invalid Credentials");
		}

        //retrieve authenticated user details once user is authenticated to be valid
        UserDetails userDetails = userAuthService.loadUserByUsername(jwtRequest.getUsername());
		String username = userDetails.getUsername();
		String userpwd = userDetails.getPassword();
        List<String> roles = userDetails.getAuthorities()
            .stream()
            .map(r -> r.getAuthority())
            .collect(Collectors.toList());

        UserVo userVo = new UserVo();
		userVo.setUsername(username);
		userVo.setPassword(userpwd);
		userVo.setUserRole(roles.get(0));

        //After successfully authenticating user, generate jwt token based on authenticated user details
        String token = jwtUtil.generateToken(userVo);

        JwtResponse response = new JwtResponse(username, token, roles.get(0));

        return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.toJson().toString());
    } 


    @PostMapping(path="/signup")
	public ResponseEntity<String> signup(@RequestBody User user) {

        //check whether user's email is in the approved_users table. If not, they are not allowed to register an account
        Optional<UserRole> urOpt = userAuthService.getEmailFromApprovedTable(user.getEmail());
        if(urOpt.isEmpty()){
            return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("Error: Not Found in Authorized List of User. You are not allowed to create an account!");
        }

        //if email is in approved_users table, check whether email or username alr exist in registered_users table
        //If alr exist, not allowed to create another account. Else, allow new account and save user data.

		Optional<User> usernameOpt = userAuthService.getUserByUsername(user.getUsername());
        Optional<User> userEmailOpt =  userAuthService.getUserByEmail(user.getEmail());

        //if both username and email is not found in registered_users table, user is new. Allow account creation
		if (usernameOpt.isEmpty() && userEmailOpt.isEmpty()) {
			user.setPassword(encoder.encode(user.getPassword()));
            userAuthService.saveUser(user);
			//return ResponseEntity.ok("User successfully registered");
            return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message","User successfully registered!")
                                .build().toString());
		} else {
			return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("User registering with this email already exists/username already exist");
		}
	}

    @GetMapping(path="/getProductImg")
    public ResponseEntity<byte[]> getPdtImgByName(@RequestParam String imgFileName){
        
        System.out.println(">>>Image File Name to Retrieve>>>"+imgFileName);

        Optional<ProductImage> pdtImageOpt = merchantSvc.getPdtImgByName(imgFileName);

        if(pdtImageOpt.isEmpty()){
            
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(pdtImageOpt.get().content());

    }

    @GetMapping(path="/getPdtInfo")
    public ResponseEntity<String> getProductInfoByName(@RequestParam String productName){

        System.out.println(">>>Product Name>>>" + productName);

        Optional<ProductInfo> pdtOpt = merchantSvc.getProductInfoByName(productName);

        if(pdtOpt.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(pdtOpt.get().toJson().toString());

    }

    @PostMapping(path="/postOrder")
    public ResponseEntity<String> insertOrder(@RequestBody CheckoutOrderDetails cods){

        System.out.println("checkoutOrder to insert>>>" + cods);

        String orderId = "";

        try{
            orderId = customerSvc.insertOrder(cods);

            //text body for confirmation order email to customer upon successful order
            String messageForCustomer = 
            "Dear Sir/Mdm, \n\nThank you for ordering with Munch Kitchen! We have received your order.\n" + 
            "You can check on your order status on our website with your order id.\n\n ORDER ID: "+ orderId +
            "\n\nRegards,\nMunch Kitchen Team";

            String messageForMerchant = 
            "Dear Merchants, \n\nYou have received a new order from "+cods.getEmail()+" with Order Id: "+orderId+
            "\nPlease login to your account to view the full order details.";
            
             
             //send order confirmation email to customer
             emailSvc.sendEmail(cods.getEmail(), confirmationEmailSubject, messageForCustomer);
             
             //send email to notify merchant of new order. Alt method: Instead of using @Value${..}
             //if merchant want to send notification email to all the staffs, can call
             //for service to retrieve employees' email from sql database
             emailSvc.sendEmail(merchantEmail, newOrderEmailSubject, messageForMerchant);
            
        }catch(DataAccessException ex){
            return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                        .add("error", ex.getMessage())
                        .build().toString());
        }
        return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                        .add("orderId", orderId)
                        .build().toString());
    }

    @GetMapping(path="/getOrderByIdAndDeliveryStatus/{orderId}")
    public ResponseEntity<String> getOrderByIdAndDeliveryStatus(@PathVariable String orderId){

        List<OrderRecord> orderRecords = customerSvc.getOrdersByIdAndDeliveryStatus(orderId);

        if(orderRecords.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("error", "No order records found in database")
                            .build().toString());
        }

        JsonArrayBuilder jab = Json.createArrayBuilder();

        for(OrderRecord orderRecord : orderRecords){
            if(orderRecord.getProduct().equals("kimchi_500")){
                orderRecord.setProduct("Munch Kitchen Original Kimchi (500g)");
            }

            else if(orderRecord.getProduct().equals("kimchi_750")){
                orderRecord.setProduct("Munch Kitchen Original Kimchi (750g)");
            }

            jab.add(orderRecord.toJsonForCustomer());
        }

        System.out.println(">>>sending out records>>>" + orderRecords.toString());
        return ResponseEntity   
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jab.build().toString()); 
        
        }

        @PutMapping(path="/updateDeliveryStatusById")
        public ResponseEntity<String> updateDeliveryStatusById(@RequestBody UpdateOrderStatus updatedStatus){

            System.out.println("Order Status to update >>>" + updatedStatus);

            int numRecordsUpdated = customerSvc.updateDeliveryStatusById(updatedStatus);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message","Update is Successful! Records Updated: %d".formatted(numRecordsUpdated))
                            .build().toString());
        }

        @PostMapping(path="/create-PaymentIntent")
        public ResponseEntity<String> createPaymentIntent(@RequestBody CheckoutOrderDetails codp){

            System.out.println("checkoutOrder details for online payment>>>" + codp);

            PaymentIntent paymentIntent = null; 

            try{
                 paymentIntent = customerSvc.createPaymentIntent(codp);
            }catch(StripeException ex) {
                //CardException and InvalidRequestException are subclass of StripeException. So we can catch those 
                //exceptions specifically if we want to. https://stripe.com/docs/error-handling?lang=java#monitor-webhooks
                System.out.println(ex.getMessage());
                
                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", ex.getMessage())
                                    .build().toString());
            }catch(Exception e){
                //to catch exception that may not be related to Stripe
                System.out.println(e.getMessage());

                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", e.getMessage())
                                    .build().toString());
            }

            System.out.println("clientSecret to send out from server >>> "+paymentIntent.getClientSecret());

            //send Client Secret of PaymentIntent instead of entire PaymentIntent object. Client Secret is the unique id of PaymentIntent
            //object. Front end can retrieve PaymentIntent object using Client Secret and the public key. Client Secret is also needed 
            //to complete payment on front end.
            return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("clientSecret", paymentIntent.getClientSecret())
                                .add("orderId", paymentIntent.getMetadata().get("order_id"))
                                .add("paymentIntentId", paymentIntent.getId())
                                .build().toString());
            
        }

        @PostMapping(path = "/postOrderforOnlinePay/{orderId}")
        public ResponseEntity<String> insertOrderforOnlinePay(@RequestBody CheckoutOrderDetails codp, @PathVariable String orderId){
            
            //save order record into session so that when webhook get payment success after multiple payment failure attempts,
            //it can save the orders retrieved from session. 
            String order_id = orderId;
            
        try{
            customerSvc.insertOrderforOnlinePay(codp, orderId);
        }catch(DataAccessException ex){
            return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                        .add("error", ex.getMessage())
                        .build().toString());
        }
        return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                        .add("orderId", order_id)
                        .add("status", "inserted")
                        .build().toString());
        }

        //If I want to retrieve Payment Intent Object from server
        @PostMapping(path="/getPaymentIntentStatus")
        public ResponseEntity<String> getPaymentIntentStatus(@RequestBody Map<String, String> payload){
            //@RequestBody map the request body to a Map<String, String> object
            //obtain paymentIntentId value from Map
            String paymentIntentId = payload.get("paymentIntentId");
            System.out.printf("Payment Intent Id received in Server >>> %s",paymentIntentId);

            PaymentIntent paymentIntentRetrieved;

            try{
                 paymentIntentRetrieved = customerSvc.retrievePaymentIntent(paymentIntentId);
            }catch(StripeException ex) {
                //CardException and InvalidRequestException are subclass of StripeException. So we can catch those 
                //exceptions specifically if we want to. https://stripe.com/docs/error-handling?lang=java#monitor-webhooks
                System.out.println(ex.getMessage());
                
                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", ex.getMessage())
                                    .build().toString());
            }catch(Exception e){
                //to catch exception that may not be related to Stripe
                System.out.println(e.getMessage());

                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", e.getMessage())
                                    .build().toString());
            }
            
            System.out.println("Payment Status from Payment Intent Retrieved >>> " + paymentIntentRetrieved.getStatus());
            //can also call for this to return payment status to client after customer confirm payment. Status is retrieved from the Payment Intent that was created for them.
            return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("status", paymentIntentRetrieved.getStatus())
                                .add("orderId", paymentIntentRetrieved.getMetadata().get("order_id"))
                                .add("clientSecret", paymentIntentRetrieved.getClientSecret())
                                .build().toString());

        }

        @PostMapping(path="/updatePaymentIntent")
        public ResponseEntity<String> updatePaymentIntent(@RequestBody UpdatePaymentIntentRequest updateRequestDetails){
            
            System.out.println("Update Payment Intent Request >>>"+ updateRequestDetails.toString());

            PaymentIntent updatedPaymentIntent;

            try{
                updatedPaymentIntent = customerSvc.updatePaymentIntent(updateRequestDetails);
            }catch(StripeException ex) {
                //CardException and InvalidRequestException are subclass of StripeException. So we can catch those 
                //exceptions specifically if we want to. https://stripe.com/docs/error-handling?lang=java#monitor-webhooks
                System.out.println(ex.getMessage());
                
                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", ex.getMessage())
                                    .build().toString());
            }catch(Exception e){
                //to catch exception that may not be related to Stripe
                System.out.println(e.getMessage());

                return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Json.createObjectBuilder()
                                    .add("errorMessage", e.getMessage())
                                    .build().toString());
            }

            System.out.println("Updated Payment Intent metadata>>> "+updatedPaymentIntent.getMetadata());
            System.out.println("Updated Payment Intent Amount >>>" + updatedPaymentIntent.getAmount());

            return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("amount", updatedPaymentIntent.getAmount())
                                .build().toString());
        }
        
        //Setting up webhook to listen to events send from Stripe. Stripe sends multiple events during the payment process and after the payment is complete
        //On the client side, the customer could close the browser window or quit the app before the callback executes, and malicious clients could manipulate the response.
        //Thats why I want a webhook to check whether payment is successful. If successful, update payment status in SQL to paid. 
        //If unsuccessful, delete the order record and send email to customer.

        @PostMapping(path="/stripe/webhook")
        public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader){
            
            if(endpointSecret.trim() == null || sigHeader == null){

                return ResponseEntity
                            .status(HttpStatusCode.valueOf(400))
                            .contentType(MediaType.APPLICATION_JSON)
                            .body("");
            }

            Event stripeEventObj;

            // Only verify the event if you have an endpoint secret defined aka if you are securing webhook.
                // Otherwise use the basic event deserialized with GSON.
                //here, since we are securing webhook, we verify and construct the webhook Event object
                //with raw request body, Stripe-Signature header, and endpoint secret
                try {
                    stripeEventObj = Webhook.constructEvent(
                        payload, sigHeader, endpointSecret.trim()
                    );
                } catch(SignatureVerificationException e){
                    // Invalid signature
                    System.out.println("⚠️  Webhook error while validating signature.");

                    return ResponseEntity
                                .status(HttpStatusCode.valueOf(400))
                                .contentType(MediaType.APPLICATION_JSON)
                                .body("");
                }

            // Deserialize the nested object inside the event
            EventDataObjectDeserializer dataObjectDeserializer = stripeEventObj.getDataObjectDeserializer();
            StripeObject stripeObject = null;
            if (dataObjectDeserializer.getObject().isPresent()) {
                stripeObject = dataObjectDeserializer.getObject().get();
            } else {
                // Deserialization failed, probably due to an API version mismatch.
                // Refer to the Javadoc documentation on `EventDataObjectDeserializer` for
                // instructions on how to handle this case, or return an error here.
            }

            // Handle the event
            switch (stripeEventObj.getType()) {
                case "payment_intent.succeeded":
                    PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                    System.out.println("Payment for PaymentIntent ID: " +paymentIntent.getId()+" of amount: "+ paymentIntent.getAmount() + " succeeded.");
                    
                    Optional<OrderRecord> orOpt = customerSvc.getOrderById(paymentIntent.getMetadata().get("order_id"));

                    //insert order record if order record by order id not found. This can happen when user entered credit card and it was declined due to
                    //various card errors. These errors are considered as payment_failed so order record was deleted. So when user retry with another 
                    //credit card, we need to insert a new order record.
                    /*if(orOpt.isEmpty()){
                        
                        //Use Gson to convert json string to Java Object
                        Gson gson = new Gson();

                        CheckoutOrderDetails codp = gson.fromJson(paymentIntent.getMetadata().get("checkoutOrderDetails"), CheckoutOrderDetails.class);

                        System.out.println("Checkout Order Details to be inserted to sql >>> "+codp.toString());
                        customerSvc.insertOrderforOnlinePay(codp, paymentIntent.getMetadata().get("order_id"));
                    }*/

                    //update payment status of order record to paid and send email of successful payment to customer once status change from processing to success.
                    int numOrdersUpdated = customerSvc.updatePaymentStatusbyId(paymentIntent.getMetadata().get("order_id"), "paid");

                    //text body for confirmation order email to customer upon successful order
                    String messageForCustomer = 
                    "Dear Sir/Mdm, \n\nThank you for ordering with Munch Kitchen! We have received your order and payment of $" +paymentIntent.getAmountReceived()/100 + 
                    "\nYou can check your order status on our website with your order id.\n\n ORDER ID: "+ paymentIntent.getMetadata().get("order_id") +
                    "\n\nRegards,\nMunch Kitchen Team";

                    String messageForMerchant = 
                    "Dear Merchants, \n\nYou have received a new order from "+paymentIntent.getReceiptEmail()+" with Order Id: "+paymentIntent.getMetadata().get("order_id")+
                    "\nPlease login to your account to view the full order details.";

                    //send order confirmation email to customer
                    emailSvc.sendEmail(paymentIntent.getReceiptEmail(), confirmationEmailSubject, messageForCustomer);
                    
                    //send email to notify merchant of new order. Alt method: Instead of using @Value${..}
                    //if merchant want to send notification email to all the staffs, can call
                    //for service to retrieve employees' email from sql database
                    emailSvc.sendEmail(merchantEmail, newOrderEmailSubject, messageForMerchant);
                    break;

                case "payment_intent.payment_failed":
                    PaymentIntent paymentIntentFailed = (PaymentIntent) stripeObject;
                    System.out.println("Payment for PaymentIntent ID: " +paymentIntentFailed.getId()+" of amount: "+ paymentIntentFailed.getAmount() + " failed.");
                    
                    //Delete order record if payment failed. Send email to customer
                    //int numOrdersDeleted = customerSvc.deleteOrderbyId(paymentIntentFailed.getMetadata().get("order_id"));

                    //update order record to "not paid; online payment failed"
                    int numOrderswFailedPayment = customerSvc.updatePaymentStatusbyId(paymentIntentFailed.getMetadata().get("order_id"),"not paid; online payment failed");
                    //text body for unsuccessful payment email to customer upon successful order
                    String unsuccessfulPaymentMessage = 
                    "Dear Sir/Mdm, \n\nYour payment of $" +paymentIntentFailed.getAmount()/100 + " is unsuccessful.\n"+
                    "We have received your order with ORDER ID: " +paymentIntentFailed.getMetadata().get("order_id")+ " but you will have to pay by cash upon receipt. Alternatively, if you have not left the payment page, you can try again with another online payment method or another credit card.\n" +
                    "If you wish to cancel your order, please contact us immediately. While waiting for your order, you can also check your order status on our webpage with your order id.\n\nRegards,\nMunch Kitchen Team";

                    String msgForMerchant = 
                    "Dear Merchants, \n\nYou have received a new order from "+paymentIntentFailed.getReceiptEmail()+" with unsuccessful online payment. Order Id: "+paymentIntentFailed.getMetadata().get("order_id")+
                    "\nPlease login to your account to view the full order details.";

                    emailSvc.sendEmail(paymentIntentFailed.getReceiptEmail(), unsuccessfulPaymentEmailSubject, unsuccessfulPaymentMessage);
                    //send email to notify merchant of new order. Alt method: Instead of using @Value${..}
                    //if merchant want to send notification email to all the staffs, can call
                    //for service to retrieve employees' email from sql database
                    emailSvc.sendEmail(merchantEmail, newOrderEmailSubject, msgForMerchant);
                    break;

                default:
                    System.out.println("Unhandled event type: " + stripeEventObj.getType());
                break;
            }

            //Send a successful 200 response to Stripe as quickly as possible because Stripe retries the event 
            //if a response isn’t sent within a reasonable time. As a result, you will receive repeated information
            //for same payment intent event. It is actually referring to the same payment intent object so we are 
            //not charging the customer multiple times.
            return ResponseEntity
                        .status(HttpStatusCode.valueOf(200))
                        .contentType(MediaType.APPLICATION_JSON)
                        .body("");
        }
}

    


