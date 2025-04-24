
export function setCookie(name: string, value: string, days = 7, path = '/'): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Strict`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  
  return null;
}

export function deleteCookie(name: string, path = '/'): void {
  setCookie(name, '', -1, path);
}

export function clearAuthCookies(): void {
  deleteCookie('auth_token');
  deleteCookie('auth_user');
} 