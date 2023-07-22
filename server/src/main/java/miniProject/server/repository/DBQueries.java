package miniProject.server.repository;

public class DBQueries {
    
        public static final String GET_REGISTERED_USER_DETAILS = """
            select * from registered_users where username = ?
            """;

        public static final String GET_REGISTERED_USER_DETAILS_BY_EMAIL = """
            select * from registered_users where email = ?
            """;

        public static final String GET_USER_ROLES = """
            select * from approved_users where email = ?
            """;

        public static final String INSERT_NEW_USER = """
            insert into registered_users (username, password, email) values (?,?,?) 
            """;

        public static final String UPDATE_PRODUCT_DESCRIPTION = """
                        update products set description = ? where name = ?
                        """;

        public static final String UPDATE_ORDER_STATUS_BY_ORDER_ID="""
                        update orders set payment_status = ?, delivery_status = ? where order_id = ?
                """;

        public static final String SQL_INSERT_IMAGE = """
            insert into images(image_id, imageFile_name, image, image_type) values (?, ?, ?, ?)
            """;

        public static final String SQL_GET_IMAGE_BY_NAME = """
                select * from images where imageFile_name = ?
                """;

        public static final String GET__ALL_ORDER_RECORDS="""
            
            SELECT o.order_id, o.customer_name, o.customer_email, o.customer_contact, o.order_date, 
            o.payment_status, o.delivery_status, o.comments, 
            SUM(od.quantity * p.standard_price * (1 - p.discount)) AS total_price, 
            od.quantity, p.name 
            FROM orders o 
            INNER JOIN order_details od ON o.order_id = od.order_id 
            INNER JOIN products p ON od.product_id = p.product_id 
            GROUP BY o.order_id, od.id 
            """;

        public static final String GET_PRODUCT_INFO_BY_NAME = """
                
                        select * from products where name = ?
                """;

        public static final String INSERT_PURCHASE_ORDER = """
                insert into orders(order_id,order_date,customer_name,customer_email,customer_contact,comments,payment_status,delivery_status)
                values (?,?,?,?,?,?,?,?)
                """;

        public static final String INSERT_ORDER_DETAILS = """
                insert into order_details (order_id,quantity,unit_price,discount,product_id)
                values
                (?,?,?,?,?)
                """;

        public static final String GET_ORDER_BY_ID_AND_DELIVERY_STATUS = """
                
        SELECT o.order_id, o.customer_name, o.order_date, o.delivery_status, o.payment_status, 
            SUM(od.quantity * p.standard_price * (1 - p.discount)) AS total_price, 
            od.quantity, p.name 
            FROM orders o 
            INNER JOIN order_details od ON o.order_id = od.order_id 
            INNER JOIN products p ON od.product_id = p.product_id
            WHERE o.order_id = ? AND o.delivery_status != 'delivered' 
            GROUP BY o.order_id, od.id 
            """;

            public static final String UPDATE_DELIVERY_STATUS_BY_ORDER_ID = """
                    update orders set delivery_status = ? where order_id = ?
                    """;
        
        public static final String UPDATE_PAYMENT_STATUS_BY_ORDER_ID = """
                update orders set payment_status = ? where order_id = ?
                """;
    
        public static final String DELETE_ORDER_BY_ORDER_ID = """
                delete from orders where order_id = ?
                """;

        public static final String GET_ORDER_BY_ID = """
                        select * from orders where order_id = ? 
                        """;
}       
