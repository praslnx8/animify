import { Message } from "../models/Message";
import chatConfig from '../config/chat_config.json';
import { Sender } from "../models/Sender";

export interface ChatRequest {
  messages: Message[];
  sender: Sender;
}

export interface ChatResponse {
  message: string;
  bs64?: string;
  prompt?: string;
  sender: Sender;
}


export async function sendChat(params: ChatRequest): Promise<ChatResponse> {

  try {
    const res = await fetch('/api/chatbot', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      context: params.messages.slice(-29).map(msg => ({
                          message: msg.text,
                          turn: msg.sender == params.sender ? 'user' : 'bot',
                          image_prompt: msg.prompt || undefined
                      })),
                      bot_profile: chatConfig.botProfiles[params.sender == Sender.Bot ? Sender.User : Sender.Bot],
                      user_profile: chatConfig.botProfiles[params.sender == Sender.Bot ? Sender.Bot : Sender.User],
                      chat_settings: chatConfig.chatSettings[params.sender == Sender.Bot ? Sender.User : Sender.Bot],
                      image_settings: chatConfig.imageSettings[params.sender == Sender.Bot ? Sender.User : Sender.Bot],
                  }),
              });
    const data = await res.json();

    if (res.ok) {
      return { message: data.response, bs64: data.image_response?.bs64, prompt: data.image_response?.prompt, sender: params.sender == Sender.Bot ? Sender.User : Sender.Bot };
    } else {
      throw new Error(data.error || `Status: ${res.status} ${res.statusText}. Response: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    throw new Error(err.message || "Exception occurred while generating photo");
  }
  
}