/**
 * Contracts for the future Laravel API. The UI talks only to CatalogRepository.
 * These shapes describe the HTTP boundary and which fields stay private.
 */

export interface ApiListMeta {
  page: number;
  perPage: number;
  total: number;
}

export interface ApiList<T> {
  data: T[];
  meta: ApiListMeta;
}

export interface ApiItem<T> {
  data: T;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface InquiryCreateRequest {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: true;
  subjectType: "service" | "property" | "partner" | "general";
  subjectId?: string;
  regionId?: string;
}

export interface InquiryCreateResponse {
  data: {
    id: string;
    status: "received";
    createdAt: string;
  };
}

/** Private listing payload. Public catalogs never receive draft fields. */
export interface ListingUpsertRequest {
  categoryId: string;
  title: string;
  description: string;
  regionId: string;
  parameters: Record<string, string>;
  photoIds: string[];
}

export interface ListingPrivate {
  id: string;
  ownerId: string;
  status: "draft" | "review" | "published" | "rejected" | "archived";
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
  payload: ListingUpsertRequest;
}

export interface ListingPublic {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  regionId: string;
  companyId: string;
  status: "published";
  updatedAt: string;
}

/** Message threads for the future messaging API. UI never pretends a send succeeded. */
export interface MessageThreadPreview {
  id: string;
  listingId: string;
  listingTitle: string;
  listingHref: string;
  peerName: string;
  preview: string;
  updatedAt: string;
  unread: number;
}

export interface MessageCreateRequest {
  threadId: string;
  body: string;
}

export interface MessageCreateResponse {
  data: {
    id: string;
    status: "queued";
    createdAt: string;
  };
}

export interface EndpointContract {
  method: "GET" | "POST" | "PATCH";
  path: string;
  auth: "public" | "partner" | "staff";
  purpose: string;
}

export const API_ENDPOINTS: EndpointContract[] = [
  { method: "GET", path: "/api/v1/taxonomy", auth: "public", purpose: "Дерево категорий классифайда" },
  { method: "GET", path: "/api/v1/taxonomy/{path}", auth: "public", purpose: "Раздел, фильтры и правила публикации" },
  { method: "GET", path: "/api/v1/listings", auth: "public", purpose: "Опубликованные объявления после модерации" },
  { method: "GET", path: "/api/v1/categories", auth: "public", purpose: "Каталог направлений" },
  { method: "GET", path: "/api/v1/categories/{slug}", auth: "public", purpose: "Направление и его услуги" },
  { method: "GET", path: "/api/v1/services", auth: "public", purpose: "Поиск и фильтр услуг" },
  { method: "GET", path: "/api/v1/services/{category}/{slug}", auth: "public", purpose: "Карточка услуги" },
  { method: "GET", path: "/api/v1/properties", auth: "public", purpose: "Каталог домов и участков" },
  { method: "GET", path: "/api/v1/properties/{slug}", auth: "public", purpose: "Карточка объекта" },
  { method: "GET", path: "/api/v1/companies", auth: "public", purpose: "Проверенные партнёры" },
  { method: "GET", path: "/api/v1/companies/{slug}", auth: "public", purpose: "Профиль компании" },
  { method: "GET", path: "/api/v1/articles", auth: "public", purpose: "База знаний" },
  { method: "GET", path: "/api/v1/articles/{slug}", auth: "public", purpose: "Статья" },
  { method: "GET", path: "/api/v1/regions", auth: "public", purpose: "Справочник регионов" },
  { method: "GET", path: "/api/v1/advertising/placements", auth: "public", purpose: "Рекламные места без тарифов до утверждения" },
  { method: "POST", path: "/api/v1/inquiries", auth: "public", purpose: "Обращение. Сейчас форма только показывает предпросмотр" },
  { method: "GET", path: "/api/v1/account/listings", auth: "partner", purpose: "Объявления кабинета" },
  { method: "POST", path: "/api/v1/account/listings", auth: "partner", purpose: "Черновик объявления" },
  { method: "PATCH", path: "/api/v1/account/listings/{id}", auth: "partner", purpose: "Правка черновика" },
  { method: "POST", path: "/api/v1/account/listings/{id}/submit", auth: "partner", purpose: "Отправка на модерацию" },
  { method: "GET", path: "/api/v1/account/company", auth: "partner", purpose: "Профиль компании" },
  { method: "PATCH", path: "/api/v1/account/company", auth: "partner", purpose: "Обновление профиля" },
  { method: "GET", path: "/api/v1/account/analytics", auth: "partner", purpose: "Показы и обращения, только при реальном трекинге" },
  { method: "GET", path: "/api/v1/messages/threads", auth: "partner", purpose: "Список диалогов" },
  { method: "GET", path: "/api/v1/messages/threads/{id}", auth: "partner", purpose: "История переписки" },
  { method: "POST", path: "/api/v1/messages/threads/{id}", auth: "partner", purpose: "Отправка сообщения (только после Backend)" },
];

export const PRIVATE_FIELDS = [
  "ListingPrivate.ownerId",
  "ListingPrivate.moderationNote",
  "InquiryCreateRequest.phone",
  "InquiryCreateRequest.email",
  "Company.documents",
  "User.email",
] as const;
