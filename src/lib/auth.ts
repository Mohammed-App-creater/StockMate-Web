import Cookies from 'js-cookie';

const TOKEN_KEY = 'stockmate_token';

export const getToken = (): string | undefined => Cookies.get(TOKEN_KEY);

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'Lax' });
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};
