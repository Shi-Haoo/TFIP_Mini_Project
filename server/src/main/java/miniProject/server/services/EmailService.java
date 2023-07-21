package miniProject.server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    //JavaMailSender interface uses the JavaMail API to send emails and is typically configured 
    //with the help of a properties file that specifies the details of the mail server to use.
    // JavaMailSender interface supports MIME messages
    @Autowired
    private JavaMailSender mailsender;

    public void sendEmail(String recipientEmail, String subject, String message){

        //SimpleMailMessage class: used to create a simple mail message including the from, to, cc, subject and text fields
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(recipientEmail);
        mailMessage.setSubject(subject);
        mailMessage.setText(message);
        //even though it's not mandatory to provide the from address, many SMTP servers would reject messages without it.
        mailMessage.setFrom("munchKitchen@noreply.com");

        mailsender.send(mailMessage);
    }
}
