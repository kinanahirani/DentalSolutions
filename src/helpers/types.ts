export type User = {
  _id: string;
  created_at: number;
  status: number;

  avatar: TypeFile | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: number | null;
};

export type TypeFile = {
  _id: string;
  created_at: number;
  extention: string;
  mime_type: string;
  size: number;
  title: string;
  url: string;
};

export enum PostStatus {
  NOT_ACTIVE = 0,
  ACTIVE = 10,
}

export type ForumPost = {
  _id: string;
  created_at: number;
  description: string;
  // topics: ForumTopics[];
  photo: TypeFile | null;
  status: PostStatus;
  myLike_id: string | null;
  likes: number;
  user_id?: string;
  user_avatar?: TypeFile | null;
  user_name?: string;
  user_business?: string;
  comments_count?: number;
};

// export type Business = {
//   _id: string;
//   name: string;
//   vat_id: string;
//   vat_photo: TypeFile | null;
//   date: number | null;
//   type: BusinessType;
//   partners?: Partner[];

//   tags: Tags[];
//   short: string;
//   address: Address | null;
//   mailing_address: Address | null;
//   website: string;
//   whatsapp: string;
//   facebook: string;
//   instagram: string;

//   phone: string;
//   email: string;

//   logo: TypeFile | null;
//   photos: TypeFile[];
//   story: string;
//   status: BusinessStatus;
// };

// export type Address = {
//   route?: string;
//   street_number?: string;
//   locality?: string;
//   apartment?: string;
//   mailbox?: string;
//   postal_code?: string;
//   description?: string;
// };

// export type Partner = {
//   name: string;
//   number: string;
//   email: string;
//   phone: string;
// };

// export type Grant = {
//   _id: string;
//   name: string;
//   apply_start: number;
//   apply_end: number;
//   status: number;
//   periods: {
//     start: number;
//     end: number;
//   }[];
//   // extras: {
//   //   period: number;
//   //   status: number;
//   //   // start: number;
//   //   end: number;
//   // }[];
// };

// export type Appointment = {
//   _id: string;
//   grant: Grant | null;
//   status: AppointmentStatus;
//   created_at: number;

//   story: string;
//   representative: Agree | null;
//   employees: Agree | null;
//   staff: number;
//   goals: string;
//   category: BusinessCategory[];

//   documents: TypeFile[];
//   bank: number | null;
//   branch: string;
//   account_number: string;

//   plan: {
//     _id: BusinessCategory;
//     amout: number | null;
//     textbox: string;
//   }[];

//   //
//   stars: string[];
//   crowns: Feedback[];

//   grant_id: string;
//   beats: Beat[];

//   stories?: {
//     _id: string;
//     viewed: boolean;
//   }[];
// };

// export type Beat = {
//   _id: string;
//   appointment_id: string;
//   grant_id: string;
//   invoice: TypeFile | null;
//   amount: number;
//   date: number;
//   business_name: string;
//   criterion: BusinessCategory | null;
//   essence: string;
//   documents: TypeFile[];
//   status: FileStatuses | null;
// };

// export type Credit = {
//   _id: string;
//   user_id: string;
//   credits: number;
//   in_out: number;
//   created_at: number;
//   description: string;
// };

// export type BusinessSearch = {
//   logo: string | null;
//   title: string;
//   type: BusinessType;
//   short: string;
//   address: string;
//   email: string;
//   phone: string;
//   tags: string[];
//   image: string | null;
// };

// export type ErrorType = {
//   field: string;
//   message: string;
// };

// export type MessageAdministration = {
//   _id: string;
//   address: string;
//   phone: string;
//   email: string | null;
//   product_id: string | null;
//   text: string;
// };

// export type Term = {
//   content: string;
//   title: string;
// };

// export type Feedback = {
//   star1: number;
//   star2: number;
//   star3: number;
//   text: string;
//   _id: string;
// };

// export type Tags = {
//   _id: string;
//   title: string;
//   children: Tags[];
//   parent_id: string | null;
//   status: number;
// };

// export type BusinessFilter = {
//   name: string;
//   locality: string;
//   tags: Tags[];
//   sort: BusinessSort;
// };

// export type Message = {
//   _id: string;
//   created_at: number;
//   title: string;
//   text: string;
//   image?: TypeFile;
//   tags?: Tags[];
//   type: MessageType;
//   status: MessageStatus;
//   html: string;
//   data?: {
//     id?: string;
//     page?: string;
//     collaboration_id?: string;
//   };
// };

// export type TermType = {
//   title: string;
//   content: string;
//   date: number;
// };

// export type ForumFilter = {
//   description: string;
//   sort: ForumSort;
//   topics: ForumTopics[];
// };

// export type ForumPost = {
//   _id: string;
//   created_at: number;
//   description: string;
//   topics: ForumTopics[];
//   photo: TypeFile | null;
//   status: PostStatus;

//   myLike_id: string | null;
//   likes: number;

//   user_id?: string;
//   user_avatar?: TypeFile | null;
//   user_name?: string;
//   user_business?: string;
//   comments_count?: number;
// };

// export type Comment = {
//   _id: string;
//   post_id: string;
//   created_at: number;
//   status: CommentStatus;
//   text: string;

//   myLike_id: string | null;
//   likes: number;

//   user_id?: string;
//   user_avatar?: TypeFile | null;
//   user_name?: string;
//   user_business?: string;
// };

// export type ForumLike = {
//   _id: string;
//   user_id: string;
//   object_id: string;
//   created_at: number;
// };

export enum ForumTopics {
  LEGAL = 10,
  MARKETING = 20,
  STRATEGY = 30,
  FINANCE = 40,
  ADVERTISING = 50,
  GENERAL = 60,
}

// export enum PostStatus {
//   NOT_ACTIVE = 0,
//   ACTIVE = 10,
// }

// export enum CommentStatus {
//   NOT_ACTIVE = 0,
//   ACTIVE = 10,
// }

// export type Collaboration = {
//   _id: string;
//   created_at: number;
//   title: string;
//   type_collaboration: CollaborationType | null;
//   tags: Tags[];
//   details: string;
//   photo: TypeFile | null;
//   status: CollaborationStatus;

//   myFavorite_id: string | null;
//   user_id?: string;
//   user?: User;
//   business?: Business;
//   offers_count?: number;
// };

// export type CollaborationFavorite = {
//   _id: string;
//   user_id: string;
//   object_id: string;
//   created_at: number;
// };

// export type CollaborationsFilter = {
//   title: string;
//   sort: CollaborationSort;
//   locality: string;
//   type_collaboration: CollaborationType | null;
//   tags: Tags[];
// };

// export type CollaborationPropose = {
//   _id: string;
//   collaboration_id: string;
//   created_at: number;
//   status: CollaborationProposeStatus | null;
//   text: string;

//   user_id?: string;
//   user?: User;
//   business?: Business;
// };

// export enum CollaborationProposeStatus {
//   DECLINED = -1,
//   NEW = 0,
//   ACCEPTED = 10,
// }

// export enum CollaborationStatus {
//   NOT_ACTIVE = 0,
//   ACTIVE = 10,
// }

// export enum CollaborationType {
//   BUY_AND_SELL = 10,
//   EXCHANGE = 20,
// }

// export enum CollaborationSort {
//   NEWEST_OLDER = 10,
//   OLDER_NEWEST = 20,
// }

// export enum ForumSort {
//   NEWEST_OLDER = 10,
//   OLDER_NEWEST = 20,
// }

// export enum MessageType {
//   ANNOUNCEMENT = 0,
//   NOTIFICATION = 10,
// }

// export enum MessageStatus {
//   NOT_ACTIVE = 0,
//   ACTIVE = 10,
// }
// export enum BusinessSort {
//   NEWEST_OLDER = 10,
//   OLDER_NEWEST = 20,
//   ALPHABETICALLY = 30,
// }

// export enum AppointmentStatus {
//   STEP_1_NEW = 10,
//   STEP_1_ERROR = 15,
//   STEP_1_WAIT = 17,
//   STEP_1_OK = 19,

//   STEP_2_NEW = 20,
//   STEP_2_ERROR = 25,
//   STEP_2_WAIT = 27,
//   STEP_2_OK = 29,

//   STEP_3_NEW = 30,
//   STEP_3_BANK_WAIT = 31,
//   STEP_3_BANK_OK = 32,
//   STEP_3_PLAN_WAIT = 33,
//   STEP_3_PLAN_OK = 34,
//   STEP_3_ERROR = 35,
//   STEP_3_WAIT = 37,
//   STEP_3_OK = 39,

//   STEP_4_NEW = 40,
//   STEP_4_ERROR = 45,
//   STEP_4_WAIT = 47,
//   STEP_4_OK = 49,

//   STEP_5_NEW = 50,
//   STEP_5_ERROR = 55,
//   STEP_5_WAIT = 57,
//   STEP_5_OK = 59,

//   EXCLUDE_FROM_GRANT = 500,
// }

// export enum Gender {
//   MAN = 0,
//   WOMAN = 1,
//   OTHER = 2,
// }

// export enum MaritalStatus {
//   SINGLE = 10,
//   MARRIED = 20,
//   WIDOWED = 30,
//   SEPARATED = 40,
//   DIVORCED = 50,
// }

// export enum BusinessType {
//   EXEMPT_DEALER = 0,
//   AUTHORIZED_DEALER = 10,
//   COMPANY_LTD = 20,
//   GENERAL = 30,
//   LIMITED_PARTNERSHIP = 40,
// }

// export enum BusinessCategory {
//   MARKETING_AND_ADVERSTISING = 10,
//   PURCHASE_OF_EQUIPMENT = 20,
//   STRATEGIC_FINANCIAL = 30,
//   ACQUISITION_OF_INVENTORY = 40,
//   RENOVATIONS = 50,
//   ESTABLISHMENT_OF_A_DELIVERY_SYSTEM = 60,
//   RENTING_A_WORK_SPACE = 70,
//   RECRUITMENT = 80,
//   PROFESSIONAL_TRAINING = 90,
//   PURCHASE_OF_A_PAYMENT_CLEARING_SYSTEM = 100,
//   ESTABLISHMENT_OF_A_WEB = 110,
//   OTHER = 120,
// }

// export enum GrantsStatus {
//   APPROVED = 10,
//   RECEIVED = 20,
//   REJECTED = 30,
// }

// export enum Agree {
//   NO = 0,
//   YES = 1,
// }

// export enum FileStatuses {
//   APPROVED = 10,
//   RECEIVED = 0,
//   REJECTED = -1,
// }

// export enum BusinessStatus {
//   DELETED = 0,
//   DRAFT = 1,
//   MODERATION = 5,
//   MODERATION_PROGRESS = 6,
//   ACTIVE = 10,
// }
