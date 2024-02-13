import {ForumTopics} from './types';

export const Config = {
  forumTopic: {
    [ForumTopics.LEGAL]: {
      label: 'Legal',
      value: ForumTopics.LEGAL,
    },
    [ForumTopics.MARKETING]: {
      label: 'Marketing',
      value: ForumTopics.MARKETING,
    },
    [ForumTopics.STRATEGY]: {
      label: 'Strategy',
      value: ForumTopics.STRATEGY,
    },
    [ForumTopics.FINANCE]: {
      label: 'Finance',
      value: ForumTopics.FINANCE,
    },
    [ForumTopics.ADVERTISING]: {
      label: 'Advertisting',
      value: ForumTopics.ADVERTISING,
    },
    [ForumTopics.GENERAL]: {
      label: 'General',
      value: ForumTopics.GENERAL,
    },
  } as {
    [key: number]: {
      label: string;
      value: ForumTopics;
    };
  },

  welcomeData: [
    {
      key: 1,
      title: 'קהילת העסקים הקטנים של ישראל',
      text: 'כאן אפשר ליצור קשרים עסקיים, לתמוך בתעשייה מקומית, ולהתייעץ יחד.',
      image: require('../UI/images/welcome_1.png'),
    },
    {
      key: 2,
      title: 'מענקי צמיחה',
      text: 'אפשרות לקבלת מענקי צמיחה לפיתוח העסק.',
      image: require('../UI/images/welcome_2.png'),
    },
    {
      key: 3,
      title: 'כלים לפיתוח העסק',
      text: 'כלים מותאמים לבעלי עסקים קטנים: שיתופי פעולה, סביבת ידע מקצועית, מאגר עסקים, ועוד…',

      image: require('../UI/images/welcome_3.png'),
    },
  ],
};
