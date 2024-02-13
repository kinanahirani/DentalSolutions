export type ErrorType = {
  field: string;
  message: string;
};

export type User = {
  id: number;
  status: UserStatus;
  fname: string;
  lname: string;
  email: string;
  avatar: string;

  facebook_id: string;
  google_id: string;
  apple_id: string;

  credits: number;
  type: number;
};

export enum UserStatus {
  NO_REGISTERED = 10,
  REGISTERED = 20,
}

export type Address = {
  id: number;
  title: string;
  fname: string;
  lname: string;
  city: string;
  street: string;
  house: string;
  appartment: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  email?: string;
  status: number;
};

export type Shipment = {
  id: number;
  label: string;
  price: string;
  free_from: string | null;
};

export type Credit = {
  id: number;
  created_at: number;
  user_id: number;
  amount: number;
  comment: string;
  type: CreditType;
  user?: User;
};

export enum CreditType {
  TYPE_IN = 1,
  TYPE_OUT = -1,
}

export type Category = {
  id: string;
  title: string;
  promotion_image: string | null;
  header_image: string | null;
  productsCount: number;
  children: Category[];
  color: string;
  parent_id: number | null;
};

export type Bundle = {
  id: number;
  title: string;
  description: string;
  images: string[];
  position: number;
  status: number;
  products: {product: Product; quantity: number}[];
  products_price: number;
  price: number;
};

export type Product = {
  id: number;
  sku: string;
  title: string;
  images: string[];
  videos: string[];
  color: string;
  categories: Category[];
  description: string;
  variants: {
    option_id: number; // size ID
    value_id: number; // size value ID
    variants?: {
      option_id: number; // diam ID
      value_id: number; // diam value ID
      prices: (number | null)[];
      sku?: string;
    }[];
    prices?: (number | null)[];
  }[];
  similars: number[];
  options: {
    option_id: number;
    values_id: number[];
  }[];
  price_types: {
    value_id: number; // diam value ID
    price_types: number; // diam TYPE value ID
  }[];
  released: number;
  colorway: string;
  application: string;
  position: number;
  table_title: string;
};

export type OrderProduct = {
  product_id: number;
  variant: {
    option_id: number;
    value_id: number;
  }[];
  quantity: number;
  price: number;
  prices?: (number | null)[];
};

export type OrderBundle = {
  bundle_id: number;
  title: string;
  products: {
    product_id: number;
    variant: {
      option_id: number;
      value_id: number;
    }[];
    quantity: number;
  }[];
  quantity: number;
  price: number;
  //  products_price: number;
};

export type Option = {
  id: number;
  title: string;
  status: number;
  values?: OptionValue[];
};

export type OptionValue = {
  id: number;
  option_id: number;
  title: string;
  sort: string;
  status: number;
};

export type Term = {
  content: string;
  title: string;
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

export type Article = {
  id: number;
  created_at: number;
  title: string;
  description: string;
  topic: string;
  photo: string | null;
  status: ArticleStatus;
  myLike_id: number | null;
  likes: number;

  user_id: number;
  user: User;
  comments_count: number;
};

export enum ArticleStatus {
  NOT_ACTIVE = 0,
  NEED_MODERATION = 5,
  ACTIVE = 10,
}

export type Comment = {
  id: string;
  post_id: string;
  created_at: number;
  text: string;

  user_id?: string;
  user: User;
};

export enum OrderStatus {
  CANCELED = -10,
  ABORTED = -1,
  NEW = 0,
  HOLD = 5,
  PAID = 10,
  PROGRESS = 20,
  SENDING = 40,
  SENT = 50,
  DELIVERED = 60,
}

export type Order = {
  id: number;
  products: OrderProduct[];
  bundles: OrderBundle[];
  address_id: number;
  shipment_type: ShipmentType;
  shipment_price: number;
  created_at: number;
  address: Address;
  total: number;
  bonus: number;

  catalog_products?: Product[];

  status?: OrderStatus;
  ups?: string;
  carrier?: string;
  shipping_url?: string;
  country: string;
};

export enum ShipmentType {
  NO_SHIPMENT = 0,
  REGULAR = 10,
  EXPRESS = 50,
}
export type AlertMessage = {
  type: string;
  dscr: string;
};

export type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export type Card = {
  // TranzilaTK: string;
  // cardtype: number;
  // created_at: number;
  // cvv: string;
  // expdate: string;
  // id: number;
  // last: string;
  // primary: number;
  // user_id: number;

  card_uid: string;
  created_at: number;
  expdate: number;
  id: number;
  last: number;
  primary: number;
  status: number;
  user_id: number;
  brand_name: string;
  card_holder_name: string;
};

export enum CardTypes {
  'none',
  'Mastercard',
  'Visa',
}

export enum MessageStatus {
  NOT_ACTIVE = 0,
  ACTIVE = 10,
}

export type Message = {
  id: number;
  title: string;
  text: string;
  created_at: number;
  message_text: string | null;
  status: MessageStatus;
  product_id: number | null;
  bundle_id: number | null;
};

export const ResponseMessages = {
  '000': 'Transaction approved',
  '001': 'Blocked confiscate card.',
  '002': 'Stolen confiscate card.',
  '003': 'Contact credit company.',
  '004': 'Refusal.',
  '005': 'Forged. confiscate card.',
  '006': 'Identity Number of CVV incorrect.',
  '007': 'Must contact Credit Card Company',
  '008': 'Fault in building of access key to blocked cards file.',
  '009': 'Contact unsuccessful.',
  '010': 'Program ceased by user instruction (ESC).',
  '011': 'No confirmation for the ISO currency clearing.',
  '012': 'No confirmation for the ISO currency type.',
  '013': 'No confirmation for charge/discharge transaction.',
  '014': 'Unsupported card',
  '015': 'Number Entered and Magnetic Strip do not match',
  '017': 'Last 4 digets not entered',
  '019': 'Record in INT_IN shorter than 16 characters.',
  '020': 'Input file (INT_IN) does not exist.',
  '021':
    'Blocked cards file (NEG) non-existent or has not been updated - execute transmission or request authorization for each transaction.',
  '022': 'One of the parameter files or vectors do not exist.',
  '023': 'Date file (DATA) does not exist.',
  '024': 'Format file (START) does not exist.',
  '025':
    'Difference in days in input of blocked cards is too large - execute transmission or request authorization for each transaction.',
  '026':
    'Difference in generations in input of blocked cards is too large - execute transmission or request authorization for each transaction.',
  '027': 'Where the magnetic strip is not completely entered',
  '028':
    'Central terminal number not entered into terminal defined for work as main supplier.',
  '029':
    'Beneficiary number not entered into terminal defined as main beneficiary.',
  '030':
    'Terminal not updated as main supplier/beneficiary and supplier/beneficiary number entered.',
  '031': 'Terminal updated as main supplier and beneficiary number entered',
  '032':
    'Old transactions - carry out transmission or request authorization for each transaction.',
  '033': 'Defective card',
  '034':
    'Card not permitted for this terminal or no authorization for this type of transaction.',
  '035': 'Card not permitted for transaction or type of credit.',
  '036': 'Expired.',
  '037':
    'Error in instalments - Amount of transaction needs to be equal to the first instalment + (fixed instalments times no. of instalments)',
  '038':
    'Cannot execute transaction in excess of credit card ceiling for immediate debit.',
  '039': 'Control number incorrect.',
  '040': 'Terminal defined as main beneficiary and supplier number entered.',
  '041':
    'Exceeds ceiling where input file contains J1 or J2 or J3 (contact prohibited).',
  '042':
    'Card blocked for supplier where input file contains J1 or J2 or J3 (contact prohibited).',
  '043': 'Random where input file contains J1 (contact prohibited).',
  '044':
    'Terminal prohibited from requesting authorization without transaction (J5)',
  '045':
    'Terminal prohibited for supplier-initiated authorization request (J6)',
  '046':
    'Terminal must request authorization where input file contains J1 or J2 or J3 (contact prohibited).',
  '047':
    'Secret code must be entered where input file contains J1 or J2 or J3 (contact prohibited).',
  '051': ' Vehicle number defective.',
  '052': 'Distance meter not entered.',
  '053':
    'Terminal not defined as gas station. (petrol card passed or incorrect transaction code).',
  '057': 'Identity Number Not Entered',
  '058': 'CVV2 Not Entered',
  '059': 'Identiy Number and CVV2 Not Entered',
  '060': 'ABS attachment not found at start of input data in memory.',
  '061': 'Card number not found or found twice',
  '062': 'Incorrect transaction type',
  '063': 'Incorrect transaction code.',
  '064': 'Type of credit incorrect.',
  '065': 'Incorrect currency.',
  '066':
    'First instalment and/or fixed payment exists for non-instalments type of credit.',
  '067': 'Number of instalments exists for type of credit not requiring this.',
  '068':
    'Linkage to dollar or index not possible for credit other than instalments.',
  '069': 'Length of magnetic strip too short.',
  '070': 'PIN terminal not defined',
  '071': 'PIN must be enetered',
  '072': 'Secret code not entered.',
  '073': 'Incorrect secret code.',
  '074': 'Incorrect secret code - last try.',
  '079': 'Currency is not listed in vector 59.',
  '080': '"Club code" entered for unsuitable credit type',
  '090': 'Transaction cancelling is not allowed for this card.',
  '091': 'Transaction cancelling is not allowed for this card.',
  '092': 'Transaction cancelling is not allowed for this card.',
  '099': 'Cannot read/write/open TRAN file.',
  '100': 'No equipment for inputting secret code.',
  '101': 'No authorization from credit company for work.',
  '107': 'Transaction amount too large - split into a number of transactions.',
  '108': 'Terminal not authorized to execute forced actions.',
  '109': 'Terminal not authorized for card with service code 587.',
  '110': 'Terminal not authorized for immediate debit card.',
  '111': 'Terminal not authorized for instalments transaction.',
  '112':
    'Terminal not authorized for telephone/signature only instalments transaction.',
  '113': 'Terminal not authorized for telephone transaction.',
  '114': 'Terminal not authorized for "signature only" transaction.',
  '115': 'Terminal not authorized for dollar transaction.',
  '116': 'Terminal not authorized for club transaction.',
  '117': 'Terminal not authorized for stars/points/miles transaction.',
  '118': 'Terminal not authorized for Isracredit credit.',
  '119': 'Terminal not authorized for Amex Credit credit.',
  '120': 'Terminal not authorized for dollar linkage.',
  '121': 'Terminal not authorized for index linkage.',
  '122': 'Terminal not authorized for index linkage with foreign cards.',
  '123':
    'Terminal not authorized for stars/points/miles transaction for this type of credit.',
  '124': 'Terminal not authorized for Isracredit payments.',
  '125': 'Terminal not authorized for Amex payments.',
  '126': 'Terminal not authorized for this club code.',
  '127':
    'Terminal not authorized for immediate debit transaction except for immediate debit cards.',
  '128': 'Terminal not authorized to accept Visa card staring with 3.',
  '129':
    'Terminal not authorized to execute credit transaction above the ceiling.',
  '130': 'Card not permitted for execution of club transaction.',
  '131': 'Card not permitted for execution stars/points/miles transaction.',
  '132':
    'Card not permitted for execution of dollar transactions (regular or telephone).',
  '133': 'Card not valid according Isracard list of valid cards.',
  '134':
    'Defective card according to system definitions (Isracard VECTOR1) - no. of figures on card - error.',
  '135':
    'Card not permitted to execute dollar transactions according to system definition (Isracard VECTOR1).',
  '136':
    'Card belongs to group not permitted to execute transactions according to system definition (Visa VECTOR 20).',
  '137':
    'Card prefix (7 figures) invalid according to system definition (Diners VECTOR21)',
  '138':
    'Card not permitted to carry out instalments transaction according to Isracard list of valid cards.',
  '139':
    'Number of instalments too large according to Isracard list of valid cards.',
  '140':
    'Visa and Diners cards not permitted for club instalments transactions.',
  '141':
    'Series of cards not valid according to system definition (Isracard VECTOR5).',
  '142':
    'Invalid service code according to system definition (Isracard VECTOR6).',
  '143':
    'Card prefix (2 figures) invalid according to system definition (Isracard VECTOR7).',
  '144': 'Invalid service code according to system definition (Visa VECTOR12).',
  '145': 'Invalid service code according to system definition (Visa VECTOR13).',
  '146': 'Immediate debit card prohibited for execution of credit transaction.',
  '147':
    'Card not permitted to execute instalments transaction according to Leumicard vector no. 31.',
  '148':
    'Card not permitted for telephone and signature only transaction according to Leumicard vector no. 31',
  '149':
    'Card not permitted for telephone transaction according to Leumicard vector no. 31',
  '150': 'Credit not approved for immediate debit cards.',
  '151': 'Credit not approved for foreign cards.',
  '152': 'Club code incorrect.',
  '153':
    'Card not permitted to execute flexible credit transactions (Adif/30+) according to system definition (Diners VECTOR21).',
  '154':
    'Card not permitted to execute immediate debit transactions according to system definition (Diners VECTOR21).',
  '155': 'Amount of payment for credit transaction too small.',
  '156': 'Incorrect number of instalments for credit transaction',
  '157':
    '0 ceiling for this type of card for regular credit or Credit transaction.',
  '158':
    '0 ceiling for this type of card for immediate debit credit transaction',
  '159': '0 ceiling for this type of card for immediate debit in dollars.',
  '160': '0 ceiling for this type of card for telephone transaction.',
  '161': '0 ceiling for this type of card for credit transaction.',
  '162': '0 ceiling for this type of card for instalments transaction.',
  '163':
    'American Express card issued abroad not permitted for instalments transaction.',
  '164': 'JCB cards permitted to carry out regular credit transactions.',
  '165': 'Amount in stars/points/miles larger than transaction amount.',
  '166': 'Club card not in terminal range.',
  '167': 'Stars/points/miles transaction cannot be executed.',
  '168': 'Dollar transaction cannot be executed for this type of card.',
  '169':
    'Credit transaction cannot be executed with other than regular credit.',
  '170': 'Amount of discount on stars/points/miles greater than permitted.',
  '171':
    'Forced transaction cannot be executed with credit/immediate debut card.',
  '172':
    'Previous transaction cannot be cancelled (credit transaction or card number not identical).',
  '173': 'Double transaction.',
  '174': 'Terminal not permitted for index linkage for this type of credit.',
  '175': 'Terminal not permitted for dollar linkage for this type of credit.',
  '176': 'Card invalid according to system definition (Isracard VECTOR1)',
  '177':
    'Cannot execute "Self-Service" transaction at gas stations except at "Self-Service at gas stations".',
  '178': 'Credit transaction forbidden with stars/points/miles.',
  '179': 'Dollar credit transaction forbidden on tourist card.',
  '180': 'Club Card can not preform Telephone Transactions',
  '200': 'Application error.',
  '700': 'Approved TEST Masav transaction',
  '701': 'Invalid Bank Number',
  '702': 'Invalid Branch Number',
  '703': 'Invalid Account Number',
  '704': 'Incorrect Bank/Branch/Account Combination',
  '705': 'Application Error',
  '706': 'Supplier directory does not exist',
  '707': 'Supplier configuration does not exist',
  '708': 'Charge amount zero or negative',
  '709': 'Invalid configuration file',
  '710': 'Invalid date format',
  '711': 'DB Error',
  '712': 'Required parameter is missing',
  '800': 'Transaction Canceled',
  '900': '3D Secure Failed',
  '903': 'Fraud suspected',
  '951': 'Protocol Error',
  '952': 'Payment not completed',
  '954': 'Payment Failed',
  '955': 'Payment status error',
  '959': 'Payment completed unsuccessfully',
} as {[key: string]: string};
