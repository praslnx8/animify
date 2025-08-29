import { Sender } from "./Sender";

export interface Message {
    id: string;
    text: string;
    sender: Sender;
    timestamp: Date;
    image?: string; // Optional base64 encoded image for the message
    imageUrl?: string; // Optional image URL for the message
    videoUrl?: string; // Optional video URL for the message
    loading?: boolean; // Indicates if the message is currently being processed
    error?: string; // Error message if something went wrong
    prompt?: string; // Optional prompt associated with the message
}