       CREATE TABLE `users` (
         `id` int(11) NOT NULL AUTO_INCREMENT,
         `email` varchar(100) NOT NULL,
         `encrypted_password` varchar(128) DEFAULT NULL,
         `reset_password_token` varchar(45) DEFAULT NULL,
         `name` varchar(200) DEFAULT NULL,
         `phone` varchar(45) DEFAULT NULL,
         `bio` text,
         `authentication_token` varchar(100) DEFAULT NULL,
         `createdAt` datetime NOT NULL,
         `updatedAt` datetime DEFAULT NULL,
         `reset_password_sent_at` datetime DEFAULT NULL,
         `groupid` int(11) NOT NULL,
         PRIMARY KEY (`id`)
       )