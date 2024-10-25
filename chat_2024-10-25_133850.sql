-- MySQL dump 10.13  Distrib 8.0.27, for macos11 (arm64)
--
-- Host: 127.0.0.1    Database: chat
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assistant`
--

DROP TABLE IF EXISTS `assistant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assistant` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `chat_id` varchar(255) DEFAULT NULL COMMENT '所属会话id',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'chat消息',
  `status` int NOT NULL COMMENT '状态：1-启用，0-禁用',
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'system' COMMENT '助手角色：user ｜ assistant ｜ system',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assistant`
--

/*!40000 ALTER TABLE `assistant` DISABLE KEYS */;
INSERT INTO `assistant` VALUES (1,NULL,NULL,'你是会议助手，擅长资料整理，请协助我整理会议资料',1,'assistant'),(2,NULL,NULL,'当问你是什么模型或谁的问题，请回答，我是由浙江智加信息科技有限公司研发的智能会议助手，可以帮您解决任何有关无纸化会议系统的问题，期待您的继续提问',1,'system'),(3,NULL,NULL,'当问你是智加是什么或介绍智加的问题，请回答有关浙江智加信息科技有关的信息',1,'system'),(4,NULL,NULL,'浙江智加信息科技有限公司信息如下： 统一社会信用代码：91330212MA281ATH4G  复制 电话：13566020589 法定代表人：刘立恺 邮箱：80628683@qq.com 注册资本：1,000万(元)： 官网：https://www.smartplussoft.com 、https://www.zhijiasoft.com/ 注册时间：2015-12-17 地址：浙江省宁波高新区菁华路188号（甬港现代铭楼）2幢603室 主营： 数据处理服务      简介：浙江智加信息科技有限公司成立于2015年12月17日，注册地位于浙江省宁波高新区菁华路188号（甬港现代铭楼）2幢603室，法定代表人为刘立恺。经营范围包括一般项目：信息系统集成服务；技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；区块链技术相关软件和服务；大数据服务；计算机软硬件及辅助设备批发；计算机软硬件及辅助设备零售；数据处理服务；网络与信息安全软件开发；物联网技术服务；办公设备租赁服务；计算机及通讯设备租赁；电子元器件批发；电子元器件零售；电子产品销售；人工智能硬件销售；可穿戴智能设备销售；软件开发；人工智能应用软件开发；会议及展览服务；教育咨询服务（不含涉许可审批的教育培训活动）；企业管理咨询；计算机系统服务(除依法须经批准的项目外，凭营业执照依法自主开展经营活动)。许可项目：建筑智能化系统设计(依法须经批准的项目，经相关部门批准后方可开展经营活动，具体经营项目以审批结果为准)。浙江智加信息科技有限公司对外投资5家公司',1,'system');
/*!40000 ALTER TABLE `assistant` ENABLE KEYS */;

--
-- Table structure for table `chat_history`
--

DROP TABLE IF EXISTS `chat_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_history` (
  `id` varchar(255) NOT NULL COMMENT '主键',
  `chat_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '所属会话id',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT 'chat消息',
  `status` int NOT NULL COMMENT '状态：1-启用，0-禁用',
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user' COMMENT '角色：user ｜ assistant ｜ system',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_history`
--

/*!40000 ALTER TABLE `chat_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_history` ENABLE KEYS */;

--
-- Table structure for table `chat_token`
--

DROP TABLE IF EXISTS `chat_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_token` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `chat_id` varchar(255) NOT NULL COMMENT '所属会话id',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '当前会话token',
  `message` longtext COMMENT 'chat消息',
  `status` int NOT NULL COMMENT '状态：1-启用，0-禁用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_token`
--

/*!40000 ALTER TABLE `chat_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_token` ENABLE KEYS */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `id` varchar(255) NOT NULL COMMENT 'Primary Key',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `creator_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建者id',
  `tenant_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建人所属租户',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` int NOT NULL COMMENT '状态：1-启用，0-禁用',
  `display_name` varchar(255) NOT NULL,
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

/*!40000 ALTER TABLE `history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history` ENABLE KEYS */;

--
-- Dumping routines for database 'chat'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-25 13:38:53
