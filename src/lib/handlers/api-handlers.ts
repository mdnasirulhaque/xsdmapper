/**
 * A generic function to handle POST requests.
 * @param url The endpoint URL to send the request to.
 * @param body The request body.
 * @param options Optional fetch options.
 * @returns The JSON response from the API.
 */
export async function postApi<T>(url: string, body: any, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    console.error(`POST request to ${url} failed:`, error.message);
    throw error;
  }
}

/**
 * A generic function to handle GET requests.
 * @param url The endpoint URL to send the request to.
 * @param options Optional fetch options.
 * @returns The JSON response from the API.
 */
export async function getApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    console.error(`GET request to ${url} failed:`, error.message);
    throw error;
  }
}
