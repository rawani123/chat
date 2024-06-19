const mongoose = require("mongoose");
const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const {from, to} = req.body
    const messages = await Messages.find({users: {$all: [from, to]}}).sort({updatedAt: 1})
    
    const projectedMessages = messages.map(message => {
        return {
            fromSelf:message.sender.toString() === from,
            message:message.message.text    
        }
    })
    return res.status(200).send({success: true, messages: projectedMessages})
} catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try 
    {
      const {from ,to ,message} = req.body
      const newMessage = new Messages({
          message: {
              text: message
          },
          users: [from, to],
          sender: from
      })
      newMessage.save()
      if(newMessage){
          return res.status(201).send({success: true, message: "Message sent successfully"})
      }
  } catch (ex) {
    next(ex);
  }
};
