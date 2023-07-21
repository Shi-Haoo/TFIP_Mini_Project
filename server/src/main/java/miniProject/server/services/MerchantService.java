package miniProject.server.services;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import miniProject.server.models.OrderRecord;
import miniProject.server.models.ProductDescription;
import miniProject.server.models.ProductImage;
import miniProject.server.models.ProductInfo;
import miniProject.server.models.UpdateOrderStatus;
import miniProject.server.repository.MerchantRepository;

@Service
public class MerchantService {
    
    @Autowired
    MerchantRepository merchantRepo;

    public Integer updateProductDescription(ProductDescription pdtDeets){

        return merchantRepo.updateProductDescription(pdtDeets);
    }

    public void insertNewProductImage(String imageFileName, MultipartFile image) throws IOException{

        String imageId = UUID.randomUUID().toString().substring(0, 8);
        merchantRepo.insertNewProductImage(imageId, imageFileName, image.getBytes(), image.getContentType());
    }

    public Integer updateOrderStatus(UpdateOrderStatus updatedStatus){

        return merchantRepo.updateOrderStatus(updatedStatus);
    }

    public Optional<ProductImage> getPdtImgByName(String imageName){
        
        return merchantRepo.getPdtImgByName(imageName);
    } 

    /*public String convertByteToB64(ProductImage pdtImage){

        StringBuilder strBdr = new StringBuilder();
		strBdr.append("data:").append(pdtImage.imageType()).append(";base64,");

		byte[] buff = pdtImage.content();
		String b64 = Base64.getEncoder().encodeToString(buff);
		strBdr.append(b64);

		String imageData = strBdr.toString();

		System.out.printf(">>> imageData: %s\n", imageData);

        return imageData;
    }*/

    public List<OrderRecord> getAllOrderRecords(){
        
        return merchantRepo.getAllOrderRecords();
    }

    public Optional<ProductInfo> getProductInfoByName(String itemName){

        return merchantRepo.getProductInfoByName(itemName);
    }

}
