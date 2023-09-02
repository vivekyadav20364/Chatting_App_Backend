const express=require("express");
const { protect } = require("../middleware/authMiddleware");
const router=express.Router();
const {sendMessage,allMessages}=require("../controllers/MessagesControllers");
router.route('/').post(protect,sendMessage);
router.route('/:chatId').get(protect,allMessages);   //here by this way we also pass data from fronted and fetch simultanously

module.exports=router;