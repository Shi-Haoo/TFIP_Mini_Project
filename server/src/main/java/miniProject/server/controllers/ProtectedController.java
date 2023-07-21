package miniProject.server.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import miniProject.server.models.OrderRecord;
import miniProject.server.models.ProductDescription;
import miniProject.server.models.ProductImage;
import miniProject.server.models.UpdateOrderStatus;
import miniProject.server.services.MerchantService;

//For all protected resources
@RestController
@RequestMapping(path="/api/protected")
public class ProtectedController {
    
    @Autowired
    MerchantService merchantSvc;

    
    //later on need to change the authorization for this mapping to only admin role

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(path="/retrieveOrders")
    public ResponseEntity<String> getOrders(){
        
        List<OrderRecord> orderRecords = merchantSvc.getAllOrderRecords();

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
            jab.add(orderRecord.toJson());
        }

        System.out.println(">>>sending out records>>>" + orderRecords.toString());
        return ResponseEntity   
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jab.build().toString()); 
        
    }

    //later on need to change the authorization for this mapping to only admin role
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(path="/updateOrderStatus")
    public ResponseEntity<String> updateOrderStatus(@RequestBody UpdateOrderStatus updatedStatus){

        System.out.println("Order Status to update >>>" + updatedStatus);
        System.out.println("order id" + updatedStatus.getOrderId());

        int numRecordsUpdated = merchantSvc.updateOrderStatus(updatedStatus);

        return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                    //return a message in case I want to display this message instead of writing own message in Angular
                            .add("message","Update is Successful! Records Updated: %d".formatted(numRecordsUpdated))
                            .build().toString());
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(path="/updateProductDescription")
    public ResponseEntity<String> updateProductDescription(@RequestBody ProductDescription pdtDeets){

        int numRecordsUpdated = merchantSvc.updateProductDescription(pdtDeets);
        
        String message = String.format("Update for %s is successful! Number of records updated: %d",
         pdtDeets.getProductName(), numRecordsUpdated);

        return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message",message)
                            .build().toString());
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(path="/insertImage")
    public ResponseEntity<String> insertNewProductImage(@RequestPart String imageFileName, @RequestPart MultipartFile myFile){

        System.out.printf(">>>imageFileName: %s\n", imageFileName);
        System.out.printf(">>>file: %s\n", myFile);

        try{
            merchantSvc.insertNewProductImage(imageFileName, myFile);
        }catch(Exception ex){
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("error", ex.getMessage())
                            .build().toString());
        }

        return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Upload Success!")
                            .build().toString());

    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping(path="/getPhoto/{imageName}")
    public ResponseEntity<byte[]> getPdtImgByName(@PathVariable String imageName){
        
        System.out.println(">>>Image File Name to Retrieve>>>"+imageName);

        Optional<ProductImage> pdtImageOpt = merchantSvc.getPdtImgByName(imageName);

        if(pdtImageOpt.isEmpty()){
            /*return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("error", "No image with the requested image file name!!")
                            .build().toString()); */
            return ResponseEntity.notFound().build();
        }

        // String base64ImgStr = merchantSvc.convertByteToB64(pdtImageOpt.get());
        // System.out.println(">>>Converted Base64 Img String >>>"+base64ImgStr);

        /*return ResponseEntity
                    .status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("content", base64ImgStr)
                            .build().toString()); */
        
            return ResponseEntity
                        .status(HttpStatus.OK)
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(pdtImageOpt.get().content());
    }


}
