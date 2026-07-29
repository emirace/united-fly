export type IContactMessage = {
  _id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  file?: string;
  assignTo?: string;
  createdAt: string;
  updatedAt: string;
};

export type ICreateContactMessage = {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  file: string[];
};

export type INewsletter = {
  _id: string;
  email: string;
  isDeleted: boolean;
  url: string;
  sent: {
    emailName: string;
    _id: string;
    updatedAt: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type IEmailList = {
  name: string;
  subject: string;
  template: string;
};

export interface MessageData {
  content: string;
  type: string;
  conversationId?: string;
  referencedUser?: string;
  referencedProduct?: string;
  image?: string;
}
export interface MessageStart {
  participantId: string;
  type: string;
}

export interface MessageStartResponse {
  participants: string[];
  type: string;
  closed: boolean;
  isGuest: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForwardData {
  receiver: string;
  messageId: string;
}

export interface ReplyData {
  receiver: string;
  content: string;
  replyTo: string;
}

export interface IMessage {
  sender: string;
  _id: string;
  image?: string;
  receiver: string;
  content: string;
  conversationId: string;
  forwardedFrom?: string;
  replyTo?: string;
  referencedUser?: string;
  referencedProduct?: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationData {
  participantId: string;
  type: string;
}
export interface IConversation {
  _id: string;
  participants: string[];
  type: string;
  createdAt: string;
  closed: boolean;
  isGuest: boolean;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: string;
    receiver: string;
  };
  unreadCount: number;
  otherUser?: {
    fullName: string;
    image: string;
  };
}
