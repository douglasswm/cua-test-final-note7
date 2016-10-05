CREATE TABLE `task` (
  `taskid` int(11) NOT NULL AUTO_INCREMENT,
  `taskname` varchar(100) NOT NULL,
  `listid` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `id` varchar(45) DEFAULT NULL,
  `taskStatus` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`taskid`)
)