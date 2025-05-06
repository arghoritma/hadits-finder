const API_BASE_URL = 'https://dorar-api.ardev.my.id';

/**
 * Represents metadata for a search result.
 */
export interface Metadata {
  length?: string; // عدد نتائج البحث (can be total results or per page)
  page?: string; // رقم الصفحة
  removeHTML?: string; // هل عناصر الـ HTML ممسوحة أم لا
  specialist?: string; // نوع الاحاديث هل هي للمتخصصين أم لا
  numberOfNonSpecialist?: string; // عدد الأحاديث لغير المتخصصين
  numberOfSpecialist?: string; // عدد الأحاديث للمتخصصين
  isCached: string; // هل هذه النتائج من الـ cache أم لا
}

/**
 * Represents a Hadith.
 */
export interface Hadith {
  hadith: string; // الحديث
  rawi: string; // الراوي
  mohdith: string; // المحدث
  mohdithId?: string; // رقم المحدث
  book: string; // الكتاب
  bookId?: string; // رقم الكتاب
  numberOrPage: string; // رقم الحديث او الصفحة
  grade: string; // درجة الصحة
  explainGrade?: string; // توضيح درجة الصحة
  takhrij?: string; // تخريج الحديث في كتب أخرى
  hadithId?: string; // رقم الحديث لاستخدامه في البحث عن الأحاديث البديلة أو الحديث البديل الصحيح
  hasSimilarHadith?: string; // هل الحديث له أحاديث مشابهة أم لا
  hasAlternateHadithSahih?: string; // هل الحديث له حديث صحيح بديل أم لا
  similarHadithDorar?: string; // رابط الأحاديث المشابهة في موقع الدرر
  alternateHadithSahihDorar?: string; // رابط الحديث الصحيح في موقع الدرر
  urlToGetSimilarHadith?: string; // رابط لكي تبحث عن الأحاديث المشابهة
  urlToGetAlternateHadithSahih?: string; // رابط لكي تبحث عن الحديث الصحيح
  hasSharhMetadata?: string; // هل الحديث له شرح أم لا
  sharhMetadata?: SharhMetadata; // metadata for Sharh
}

/**
 * Represents the metadata for Sharh.
 */
export interface SharhMetadata {
  id: string; // رقم الشرح
  isContainSharh: string; // هل يحتوى هذا الرد على شرح الحديث أم لا؟
  urlToGetSharh: string; // رابط لكي تبحث عن شرح الحديث
  sharh?: string; // شرح الحديث (present if isContainSharh is true and fetched)
}

/**
 * Represents the search result data.
 */
export interface SearchResult {
  metadata: Metadata;
  data: Hadith[];
}

/**
 * Represents a single Hadith result.
 */
export interface HadithResult {
  metadata: Metadata;
  data: Hadith;
}


/**
 * Represents the metadata for Muhdith.
 */
export interface Muhdith {
    name: string; // المحدث
    mohdithId: string; // رقم المحدث
    info: string; // معلومات عن المحدث
}

/**
 * Represents the metadata for Book.
 */
export interface Book {
    name: string; // الكتاب
    bookId: string; // رقم الكتاب
    author: string; // المؤلف
    reviewer?: string; // المراجع
    publisher?: string; // دار النشر
    edition?: string; // رقم الطبعة
    editionYear?: string; // سنة الطبعة
}

interface MuhdithResult {
  metadata: Metadata;
  data: Muhdith;
}

interface BookResult {
  metadata: Metadata;
  data: Book;
}


async function fetchApi<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { cache: 'no-store' }); // Disable caching for fresh data
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error ${response.status} for ${url}: ${errorBody}`);
      throw new Error(`Network response was not ok: ${response.statusText} - ${errorBody}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json() as Promise<T>;
    } else {
        // Handle non-JSON responses, like HTML error pages from the API
        const textResponse = await response.text();
        console.warn(`API response for ${url} was not JSON: ${textResponse.substring(0,100)}...`);
        // Attempt to parse, but might fail. Or, handle as an error.
        // For now, let's assume if it's not JSON, it's an error or unexpected format.
        try {
          return JSON.parse(textResponse) as Promise<T>; // This might still work for malformed JSON responses with correct headers
        } catch(e) {
          throw new Error(`Response was not JSON and could not be parsed: ${textResponse.substring(0, 200)}`);
        }
    }
  } catch (error) {
    console.error(`Fetch API error for ${endpoint}:`, error);
    throw error;
  }
}


/**
 * Asynchronously searches for hadiths based on a query and page number.
 * Uses the /v1/site/hadith/search endpoint for more detailed results.
 *
 * @param query The search query.
 * @param page The page number.
 * @returns A promise that resolves to a SearchResult object.
 */
export async function searchHadiths(query: string, page: number = 1): Promise<SearchResult> {
  const encodedQuery = encodeURIComponent(query);
  // Using /v1/site/hadith/search as requested for more detailed results
  return fetchApi<SearchResult>(`/v1/site/hadith/search?value=${encodedQuery}&page=${page}&removehtml=true`);
}

/**
 * Asynchronously retrieves a hadith by its ID.
 * Uses the /v1/site/hadith/:id endpoint.
 *
 * @param id The ID of the hadith to retrieve.
 * @returns A promise that resolves to a HadithResult object.
 */
export async function getHadithById(id: string): Promise<HadithResult> {
  return fetchApi<HadithResult>(`/v1/site/hadith/${id}?removehtml=true`);
}


/**
 * Asynchronously retrieves similar hadiths by its ID.
 * Uses the /v1/site/hadith/similar/:id endpoint.
 *
 * @param id The ID of the hadith to retrieve similar hadiths.
 * @returns A promise that resolves to a SearchResult object.
 */
export async function getSimilarHadithsById(id: string): Promise<SearchResult> {
  return fetchApi<SearchResult>(`/v1/site/hadith/similar/${id}?removehtml=true`);
}

/**
 * Asynchronously retrieves alternate hadiths by its ID.
 * Uses the /v1/site/hadith/alternate/:id endpoint.
 *
 * @param id The ID of the hadith to retrieve alternate hadiths.
 * @returns A promise that resolves to a HadithResult object.
 */
export async function getAlternateHadithsById(id: string): Promise<HadithResult> {
  return fetchApi<HadithResult>(`/v1/site/hadith/alternate/${id}?removehtml=true`);
}

/**
 * Asynchronously retrieves Sharh by its ID.
 * Uses the /v1/site/sharh/:id endpoint.
 *
 * @param id The ID of the Sharh to retrieve.
 * @returns A promise that resolves to a HadithResult object (API returns Hadith-like structure with Sharh).
 */
export async function getSharhById(id: string): Promise<HadithResult> {
  return fetchApi<HadithResult>(`/v1/site/sharh/${id}?removehtml=true`);
}

/**
 * Asynchronously retrieves Sharh by text.
 * Uses the /v1/site/sharh/text/:text endpoint.
 *
 * @param text The text of the Sharh to retrieve.
 * @returns A promise that resolves to a HadithResult object.
 */
export async function getSharhByText(text: string): Promise<HadithResult> {
  const encodedText = encodeURIComponent(text);
  return fetchApi<HadithResult>(`/v1/site/sharh/text/${encodedText}?removehtml=true`);
}

/**
 * Asynchronously search Sharh by text.
 * Uses the /v1/site/sharh/search?value={text} endpoint.
 *
 * @param text The text to search Sharh with.
 * @returns A promise that resolves to a SearchResult object.
 */
export async function searchSharh(text: string, page: number = 1): Promise<SearchResult> {
  const encodedText = encodeURIComponent(text);
  return fetchApi<SearchResult>(`/v1/site/sharh/search?value=${encodedText}&page=${page}&removehtml=true`);
}

/**
 * Asynchronously retrieves Muhdith by its ID.
 * Uses the /v1/site/mohdith/:id endpoint.
 *
 * @param id The ID of the Muhdith to retrieve.
 * @returns A promise that resolves to a Muhdith object.
 */
export async function getMuhdithById(id: string): Promise<Muhdith> {
  const result = await fetchApi<MuhdithResult>(`/v1/site/mohdith/${id}`);
  return result.data;
}

/**
 * Asynchronously retrieves Book by its ID.
 * Uses the /v1/site/book/:id endpoint.
 *
 * @param id The ID of the Book to retrieve.
 * @returns A promise that resolves to a Book object.
 */
export async function getBookById(id: string): Promise<Book> {
   const result = await fetchApi<BookResult>(`/v1/site/book/${id}`);
   return result.data;
}

// Types for data endpoints (e.g., /v1/data/book)
export interface DataItem {
  key: string; // الكلمة المفتاحية
  value: string; // القيمة
}

/**
 * Fetches generic data lists like books, degrees, etc.
 * @param dataType e.g., "book", "degree"
 * @returns A promise that resolves to an array of DataItem.
 */
export async function getDataList(dataType: 'book' | 'degree' | 'methodSearch' | 'mohdith' | 'rawi' | 'zoneSearch'): Promise<DataItem[]> {
  return fetchApi<DataItem[]>(`/v1/data/${dataType}`);
}
