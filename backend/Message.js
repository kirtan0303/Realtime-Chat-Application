const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'file']
        },
        url: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);
