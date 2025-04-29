import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getChats();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch chats' });
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (chatData, { rejectWithValue }) => {
    try {
      return await chatService.createChat(chatData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create chat' });
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      return await chatService.getMessages(chatId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch messages' });
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      return await chatService.sendMessage(messageData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null
  },
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.currentChat = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateChatList: (state, action) => {
      const chatIndex = state.chats.findIndex(
        (chat) => chat._id === action.payload._id
      );
      if (chatIndex >= 0) {
        state.chats[chatIndex] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  }
});

export const { setCurrentChat, clearChat, addMessage, updateChatList } = chatSlice.actions;
export default chatSlice.reducer;
