CREATE TABLE `list` (
  `listid` int(11) NOT NULL AUTO_INCREMENT,
  `listname` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `groupid` int(11) NOT NULL,
  PRIMARY KEY (`listid`)
)