export const IMAGES_URL = 'https://dental.shtibel.com';
// export const IMAGES_URL = 'https://api-dental.bweb.studio';
// export const IMAGES_URL = 'https://41af-86-57-221-144.ngrok-free.app';
const ROUTE = 'https://team10.devhostserver.com/dental/frontend/web/rest/v1/';

// const ROUTE = `${IMAGES_URL}/rest/v1/`;

const api = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body = {},
  token: string | null = '',
): Promise<any | null> => {
  // console.log('i18n.language', i18n.language);
  const fetchObj: RequestInit = {
    method: method,
    // credentials: 'omit',
    // cache: 'no-cache',
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      // lang: i18n.language,
    }),
  };

  if (method.toUpperCase() !== 'GET') {
    fetchObj.body = JSON.stringify(body);
  }

  if (token) {
    fetchObj.headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      // lang: i18n.language,
    });
  }

  try {
    const response = await fetch(ROUTE + endpoint, fetchObj);
    if (response.ok && response.status >= 200 && response.status < 204) {
      const data = await response.json();
      if (response.headers.get('x-pagination-total-count')) {
        return new Promise(resolve =>
          resolve({
            data,
            total: parseInt(
              response.headers.get('x-pagination-total-count') || '0',
              10,
            ),
          }),
        );
      }
      return data;
    } else if (response.ok && response.status === 204) {
      return {};
    } else {
      console.error(response);
      return {error: await response.json()};
      // throw new Error(response.statusText);
    }
  } catch (error: any) {
    console.error('API error:', error.message);
    // throw new Error(error);
    return {
      error: error.message,
    };
  }
};

export default api;
